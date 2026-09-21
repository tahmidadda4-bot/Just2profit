require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function tokenFor(user) {
  return jwt.sign({ id: user.id, phone: user.phone }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function auth(req,res,next) {
  try {
    const h = req.headers.authorization || '';
    const t = h.startsWith('Bearer ') ? h.slice(7) : '';
    req.user = jwt.verify(t, process.env.JWT_SECRET);
    next();
  } catch { res.status(401).json({error:'Unauthorized'}); }
}

app.get('/api/health', (req,res)=>res.json({ok:true, app:'Just2Profit'}));

app.post('/api/register', async (req,res)=>{
  try {
    const {fullName, phone, password, referralCode} = req.body;
    if (!fullName || !phone || !password) return res.status(400).json({error:'Required fields missing'});
    const hash = await bcrypt.hash(password, 12);
    const q = await pool.query(
      `INSERT INTO users(full_name,phone,password_hash,referral_code,referred_by)
       VALUES($1,$2,$3,upper(substr(md5(random()::text),1,8)),(SELECT id FROM users WHERE referral_code=$4))
       RETURNING id,full_name,phone,referral_code`,
      [fullName, phone, hash, referralCode || null]
    );
    await pool.query('INSERT INTO wallets(user_id) VALUES($1)', [q.rows[0].id]);
    res.json({user:q.rows[0], token:tokenFor(q.rows[0])});
  } catch(e) { res.status(400).json({error:'Registration failed', detail:e.code === '23505' ? 'Phone already exists' : 'Server error'}); }
});

app.post('/api/login', async (req,res)=>{
  const {phone,password}=req.body;
  const q=await pool.query('SELECT * FROM users WHERE phone=$1 AND status=$2',[phone,'active']);
  if(!q.rows[0] || !(await bcrypt.compare(password,q.rows[0].password_hash))) return res.status(401).json({error:'Invalid login'});
  const u=q.rows[0]; res.json({user:{id:u.id,fullName:u.full_name,phone:u.phone,referralCode:u.referral_code},token:tokenFor(u)});
});

app.get('/api/me', auth, async (req,res)=>{
  const u=(await pool.query('SELECT id,full_name,phone,referral_code FROM users WHERE id=$1',[req.user.id])).rows[0];
  const w=(await pool.query('SELECT balance FROM wallets WHERE user_id=$1',[req.user.id])).rows[0];
  res.json({user:u,balance:w?.balance||0});
});

app.get('/api/tasks', auth, async (req,res)=>{
  const q=await pool.query('SELECT id,title,description,reward FROM tasks WHERE active=true ORDER BY id DESC');
  res.json(q.rows);
});

app.post('/api/withdrawals', auth, async (req,res)=>{
  const {amount,method,accountNumber}=req.body;
  if(!amount || amount<=0 || !method || !accountNumber) return res.status(400).json({error:'Invalid request'});
  const client=await pool.connect();
  try {
    await client.query('BEGIN');
    const w=(await client.query('SELECT balance FROM wallets WHERE user_id=$1 FOR UPDATE',[req.user.id])).rows[0];
    if(!w || Number(w.balance)<Number(amount)) throw new Error('Insufficient balance');
    await client.query('UPDATE wallets SET balance=balance-$1,updated_at=NOW() WHERE user_id=$2',[amount,req.user.id]);
    await client.query('INSERT INTO withdrawals(user_id,amount,method,account_number) VALUES($1,$2,$3,$4)',[req.user.id,amount,method,accountNumber]);
    await client.query('INSERT INTO transactions(user_id,type,amount,note) VALUES($1,$2,$3,$4)',[req.user.id,'withdrawal_hold',amount,'Withdrawal request']);
    await client.query('COMMIT');
    res.json({ok:true});
  } catch(e) { await client.query('ROLLBACK'); res.status(400).json({error:e.message}); }
  finally { client.release(); }
});

app.listen(process.env.PORT||3000,()=>console.log('Just2Profit API running'));

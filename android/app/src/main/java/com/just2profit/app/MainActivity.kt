package com.just2profit.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

data class Task(val title:String,val reward:String,val description:String)

class MainActivity: ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { Just2ProfitApp() }
    }
}

@Composable
fun Just2ProfitApp() {
    var page by remember { mutableStateOf("home") }
    val tasks = listOf(
        Task("Daily Task","৳10","Complete the assigned activity."),
        Task("Profile Task","৳5","Complete your profile information.")
    )
    MaterialTheme {
        Scaffold(
            topBar={TopAppBar(title={Text("Just2Profit")})},
            bottomBar={
                NavigationBar {
                    NavigationBarItem(selected=page=="home",onClick={page="home"},icon={},label={Text("Home")})
                    NavigationBarItem(selected=page=="tasks",onClick={page="tasks"},icon={},label={Text("Tasks")})
                    NavigationBarItem(selected=page=="wallet",onClick={page="wallet"},icon={},label={Text("Wallet")})
                    NavigationBarItem(selected=page=="ref",onClick={page="ref"},icon={},label={Text("Referral")})
                }
            }
        ) { pad ->
            when(page) {
                "tasks" -> TaskPage(tasks,Modifier.padding(pad))
                "wallet" -> WalletPage(Modifier.padding(pad))
                "ref" -> ReferralPage(Modifier.padding(pad))
                else -> HomePage(Modifier.padding(pad))
            }
        }
    }
}

@Composable fun HomePage(mod:Modifier)=Column(mod.padding(20.dp)){Text("Welcome to Just2Profit",style=MaterialTheme.typography.headlineSmall);Spacer(Modifier.height(18.dp));Text("Available balance");Text("৳ 0.00",style=MaterialTheme.typography.headlineMedium);Spacer(Modifier.height(18.dp));Text("Complete genuine tasks to earn rewards.")}

@Composable fun TaskPage(tasks:List<Task>,mod:Modifier)=LazyColumn(mod.padding(16.dp)){items(tasks.size){i->Card(Modifier.fillMaxWidth().padding(bottom=12.dp)){Column(Modifier.padding(16.dp)){Text(tasks[i].title,style=MaterialTheme.typography.titleLarge);Text(tasks[i].description);Text("Reward: ${tasks[i].reward}");Spacer(Modifier.height(8.dp));Button(onClick={}){Text("Open Task")}}}}}

@Composable fun WalletPage(mod:Modifier)=Column(mod.padding(20.dp)){Text("Wallet",style=MaterialTheme.typography.headlineSmall);Text("Balance: ৳ 0.00");Spacer(Modifier.height(12.dp));Button(onClick={}){Text("Request Withdrawal")}}

@Composable fun ReferralPage(mod:Modifier)=Column(mod.padding(20.dp)){Text("Referral",style=MaterialTheme.typography.headlineSmall);Text("Your referral code will appear here.");Text("Referral bonus will be credited only after verified conditions are met.")}

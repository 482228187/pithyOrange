<template>
  <el-row style="padding-top: 100px">

    <el-col :span="8" :xs="0"/>
    <el-col :span="8" :xs="48">
      <div class="login-container">
        <h2 class="login-title">欢迎登录</h2>
        <el-input :autofocus="true" v-model="username" placeholder="请输入您的用户名" class="login-input" @keyup.enter="Login"></el-input>
        <el-input v-model="password" placeholder="请输入您的密码" class="login-input" show-password></el-input>
        <el-button type="primary" @click="Login" class="login-button">登录</el-button>
      </div>
    </el-col>
    <el-col :span="8" :xs="0"/>

  </el-row>

</template>

<script setup>

import {login} from '@/api/common/login.js'
import {ref} from "vue";
import {useRouter} from "vue-router";


const router = useRouter()
const username = ref('')
const password = ref('')

function Login() {
  login({username: username.value,password: password.value}).then(res => {
    if (res.success) {
      ElMessage.success(res.message)
      router.push({path: '/admin'})
    } else {
      ElMessage.error(res.message)
    }
  })
}

</script>

<style scoped>
.login-container {

  margin: 0 auto;
  padding: 50px;
  box-shadow: 0 0 10px rgba(227, 19, 19, 0.1);
  border-radius: 4px;
}

.login-title {
  text-align: center;
  margin-bottom: 20px;
}

.login-input {
  margin-bottom: 20px;
}

.login-button {
  margin: 0 auto;
  width: 100%;
}
</style>

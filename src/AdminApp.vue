<template>
  <v-app id="inspire">
    <v-toolbar color="indigo" dark fixed app>
      <v-toolbar-title>Million-Bachelor</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-tabs slot="extension" v-model="currentTab" centered color="indigo" slider-color="yellow">
        <!-- <v-tab href="#tab-0">二维码</v-tab> -->
        <v-tab href="#tab-1">冲顶题库</v-tab>
        <v-tab href="#tab-2">答题流程</v-tab>
        <v-tab href="#tab-3">发红包</v-tab>
        <v-tab href="#tab-4">抽奖</v-tab>
        <v-tab href="#tab-5">系统</v-tab>
      </v-tabs>
    </v-toolbar>

    <v-content v-if="needPassword">
      <v-card style="max-width: 500px;margin:2em auto">
        <v-card-text>
          <v-text-field
            v-model="password"
            type="password"
            label="管理员密码"
            hint="请提供一个管理员密码"
            counter
            @keypress.enter.prevent="submitPassword"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="submitPassword">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-content>

    <v-content v-else>
      <v-tabs-items v-model="currentTab">
        <!-- <v-tab-item value="tab-0">
          <GMQRCode/>
        </v-tab-item>-->
        <v-tab-item value="tab-1">
          <GMQuizEdit/>
        </v-tab-item>

        <v-tab-item value="tab-2">
          <GMControl/>
        </v-tab-item>

        <v-tab-item value="tab-3">
          <GMSendWX/>
        </v-tab-item>

        <v-tab-item value="tab-4">
          <GMLucky/>
        </v-tab-item>

        <v-tab-item value="tab-5">
          <GMSys/>
        </v-tab-item>
      </v-tabs-items>
    </v-content>
    <v-footer color="indigo" app>
      <v-flex white--text text-xs-center>&copy; 2019</v-flex>
    </v-footer>

    <v-dialog v-if="!!notice" :value="true" width="500" persistent>
      <v-card>
        <v-card-text>{{ notice.text }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="notice=null">知道了</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
// import GMQRCode from "./components/GMQRCode";
import GMQuizEdit from "./components/GMQuizEdit";
import GMControl from "./components/GMControl";
import GMSendWX from "./components/GMSendWX";
import GMLucky from "./components/GMLucky";
import GMSys from "./components/GMSys";
import socket from "./socket";

export default {
  data() {
    return {
      currentTab: "tab-1",
      notice: null,
      password: "",
      needPassword: true
    };
  },
  components: {
    // GMQRCode,
    GMQuizEdit,
    GMControl,
    GMSendWX,
    GMLucky,
    GMSys
  },
  mounted() {
    socket.on("notice", n => {
      this.notice = n;
    });

    socket.on("adminAuthResult", pass => {
      this.needPassword = !pass;
    });
  },
  methods: {
    submitPassword() {
      let password = this.password;
      if (!password) return;
      socket.emit("adminAuth", { password });
    }
  }
};
</script>

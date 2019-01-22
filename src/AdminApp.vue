<template>
  <v-app id="inspire">
    <v-toolbar color="indigo" dark fixed app>
      <v-toolbar-title>Million-Bachelor</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-tabs slot="extension" v-model="currentTab" centered color="indigo" slider-color="yellow">
        <!-- <v-tab href="#tab-0">二维码</v-tab> -->
        <v-tab href="#tab-1">题目编辑</v-tab>
        <v-tab href="#tab-2">流程控制</v-tab>
        <v-tab href="#tab-3">发红包</v-tab>
        <v-tab href="#tab-4">抽奖</v-tab>
      </v-tabs>
    </v-toolbar>

    <v-content>
      <v-tabs-items v-model="currentTab">
        <!-- <v-tab-item value="tab-0">
          <GMQRCode/>
        </v-tab-item> -->

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
          <v-btn color="green darken-1" flat="flat" @click="notice=null">关闭</v-btn>
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
import socket from "./socket";

export default {
  data() {
    return {
      currentTab: "tab-1",
      notice: null
    };
  },
  components: {
    // GMQRCode,
    GMQuizEdit,
    GMControl,
    GMSendWX,
    GMLucky,
  },
  mounted() {
    socket.on("notice", n => {
      this.notice = n;
    });
  }
};
</script>

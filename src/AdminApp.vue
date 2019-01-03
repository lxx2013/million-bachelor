<template>
  <v-app id="inspire">
    <v-toolbar color="indigo" dark fixed app>
      <v-toolbar-title>Million-Bachelor</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-tabs slot="extension" v-model="currentTab" centered color="indigo" slider-color="yellow">
        <v-tab href="#tab-0">二维码</v-tab>
        <v-tab href="#tab-1">题目编辑</v-tab>
      </v-tabs>
    </v-toolbar>

    <v-content>
      <v-tabs-items v-model="currentTab">
        <v-tab-item value="tab-0">
          <v-container fluid fill-height>Hello</v-container>
        </v-tab-item>

        <v-tab-item value="tab-1">
          <GMQuizEdit/>
        </v-tab-item>
      </v-tabs-items>
    </v-content>
    <v-footer color="indigo" app>
      <v-flex white--text text-xs-center>&copy; 2017</v-flex>
    </v-footer>
  </v-app>
</template>

<script>
import GMQuizEdit from "./components/GMQuizEdit";

export default {
  data() {
    return {
      currentTab: "tab-1"
    };
  },
  components: {
    GMQuizEdit
  }
};
</script>

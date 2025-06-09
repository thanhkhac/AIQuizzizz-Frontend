import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import { createPersistedState } from "pinia-plugin-persistedstate";

import App from "./App.vue";
import router from "./router/router-index";

/**
 * highchart
 * **/
import HighchartsVue from "highcharts-vue";

/**
 * jquery
 * **/
// @ts-ignore
import $ from "jquery";
window.$ = $; //register jquery as global

import axios from "axios";
window.axios = axios; //register axios as global

import API from "@/api/Api";
window.api = API; //register api as global

const app = createApp(App);

const pinia = createPinia();
pinia.use(createPersistedState());

app.use(pinia);
app.use(router);

/**
 * ant-design
 * **/
import {
  Alert,
  Pagination,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
  InputNumber,
  Select,
  Switch,
  Dropdown,
  Checkbox,
  Upload,
  Radio,
  Tooltip,
  Row,
  Col,
  Divider,
  Popconfirm,
  Menu,
  QRCode,
  Tag,
  Calendar,
  Empty,
  Badge,
  Steps,
} from "ant-design-vue";


/**
 * ant-design
 * **/
app.use(Alert);
app.use(Pagination);
app.use(Button);
app.use(Modal);
app.use(Form);
app.use(Input);
app.use(InputNumber);
app.use(DatePicker);
app.use(TimePicker);
app.use(Checkbox);
app.use(Select);
app.use(Switch);
app.use(Dropdown);
app.use(Upload);
app.use(Radio);
app.use(Tooltip);
app.use(Row);
app.use(Col);
app.use(Divider);
app.use(Popconfirm);
app.use(Menu);
app.use(QRCode);
app.use(Tag);
app.use(Calendar);
app.use(Empty);
app.use(Badge);
app.use(Steps);

/**
 * highcharts
 * **/
app.use(HighchartsVue);

app.mount("#app");

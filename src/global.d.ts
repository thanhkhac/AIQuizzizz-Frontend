import type { Axios } from "axios";
import { API } from "./api/Api";
import jQuery from "jquery";

declare global {
  interface Window {
    axios: Axios;
    $: jQuery;
    api: API;
  }
}

export {};

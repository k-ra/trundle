import { writable } from "svelte/store";

export const start = writable({ stop_name: "click start" });
export const dest = writable({ stop_name: "click stop" });

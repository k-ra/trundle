import { writable } from "svelte/store";

export const start = writable({ stop_name: "click start", stop_id: 0 });
export const dest = writable({ stop_name: "click destination", stop_id: 0 });

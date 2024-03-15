<script lang="ts">
    import Page from "../routes/+page.svelte";
    export let stops;
    import { start, dest } from "../stores/userdata.js";
    let status = "start";
    let input_route = new Array(2);

    function handleStopClick(stop_id: number) {
        if (status === "start") {
            start.set(stop_id);
            status = "end";
        } else {
            dest.set(stop_id);
            status = "";
        }
    }
</script>

{#if status}
    <h1>input your {status} stop</h1>
    {#each stops as { stop_id, stop_name }}
        <button class={status} on:click={() => handleStopClick(stop_id)}>
            {stop_name}
        </button>
    {/each}
{/if}
<h2>
    outdoor!!!start: {$start} stop: {$dest}
</h2>

<style>
    .start {
        color: #20af8c;
    }
    .end {
        color: #8422a3;
    }

    button {
        font-size: 25pt;
        font-weight: normal;
        border: none;
        background-color: white;
        transition: all 0.3s ease-out 50ms;
    }

    button:hover {
        font-weight: bolder;
        font-size: 30pt;
    }
</style>

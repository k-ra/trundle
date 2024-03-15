<script lang="ts">
    export let stops;
    import { user_route } from "../stores/userdata.js";
    let status = "start";
    // let user_route = new Array(2);

    function handleStopClick(stop_id: number) {
        if (status == "start") {
            user_route[0].set(stop_id);
            status = "end";
        } else {
            user_route[1].set(stop_id);
        }
    }
</script>

<h1>input your {status} stop</h1>
{#each stops as { stop_id, stop_name }}
    <button class={status} on:click={() => handleStopClick(stop_id)}>
        {stop_name}
    </button>
{/each}

<h2>
    TESTING!!! start stop id = {user_route[0]}. end stop id = {user_route[1]}
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

<script lang="ts">
    let status = "start";
    let user_route = new Array(2);
    let stops = [
        { stop_id: 1, stop_name: "WIDENER" },
        { stop_id: 2, stop_name: "QUAD" },
    ];

    function handleStopClick(stop_id: number) {
        if (status == "start") {
            user_route[0] = stop_id;
            status = "end";
        } else {
            user_route[1] = stop_id;
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
        color: green;
    }
    .stop {
        color: red;
    }
    button {
        font-size: 25pt;
    }
</style>

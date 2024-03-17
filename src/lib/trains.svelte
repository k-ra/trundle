<script lang="ts">
    import { start } from "../stores/userdata.js";
    // import: # of distinct routes
    let numroutes;
    // import: trains
    let trains = new Array(numroutes);

    let traineta = 25; //for testing

    // //formatting the trains
    // function traintransform(trains: Array<object>) {
    //     for (let train in trains) {
    //         //let eta = train.eta;
    //         let etaPx = 100 - traineta;
    //         return "transform: translate(${etaPx}px, 10px)";
    //     }
    //     //transform: translate(30%, 50%);
    // }

    function traintransform1(eta: number) {
        let etaPx = 1200 - eta * 40;
        return `transform: translate(${etaPx}px, 0%)`;

        //transform: translate(30%, 50%);
    }
    function tracktransform(count: number) {
        let reactivesz = 30 + 50 / count;
        //let heightpx = count * 20;
        return "transform: translate(${reactivesz}%, 100%)";
        //transform: translate(30%, 50%);
    }

    // array: top trip of each route, name of route and ETA
    // if: less than 25 min, then show
    //         show it on the line. calculate 0 eta = right. 25 eta = left.
    //         reactive? think about it later.
    // else: put a little bubble with "ETA" on the left side of screen
</script>

<div class="styleheader">
    {$start.stop_name}
    <!-- <img src="stop.png" alt="trainstop" /> -->
    <!-- style={traintransform1(500)} -->
</div>
<div class="train_container">
    <div class="track" style={tracktransform(1)}>
        <img
            class="train"
            src="trains/2235.png"
            alt="alt"
            style={traintransform1(30)}
        />
    </div>
</div>
<div class="train_container">
    hi
    <!-- {#each trains as train, i}
        <div class="track" style={tracktransform(i + 1)}>
            <img src="track.png" alt="train track of {train.route_name}" />
            <div class="train" style={traintransform(train.eta)}>
                <img
                    src="{train.route_id}.png"
                    alt="the {train.route_name} is {train.eta} away"
                />
            </div>
        </div>
    {/each} -->
</div>

<style>
    .train_container {
        width: 100%;
        /* display: flex; */
        position: relative;
    }
    .track {
        background-image: url("tracks.jpg");
        background-repeat: no-repeat;
        background-position: center;
        background-size: auto;
    }
    .train {
        width: 350px;
        /* transform: translate(1200px, 0%); */
    }
</style>

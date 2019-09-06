const EventHandler = (keyStates, player) => {
        if(keyStates.inputs["z"]) {
            player.moveTurret(false);     
        }
        if(keyStates.inputs["c"]) {
            player.moveTurret(true);     
        }

        if(keyStates.inputs["ArrowLeft"]) {
            player.move(false);
        }

        if(keyStates.inputs["ArrowRight"]) {
            player.move(true);
        }
        // if(keyStates.inputs[" "]) {
        //     player.jump();
        // }
        if(keyStates.inputs["x"]) {
            player.fire();
        }
}

export { EventHandler };
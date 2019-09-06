export default class KeyStates {
    constructor() {
        this.inputs = {};
    }
    inputOn(e) {
        this.inputs[e.key] = true;
    }
    inputOff(e) {
        this.inputs[e.key] = false;
    }
}

class Input {
    constructor(_name, _key) {
        this.name = _name
        this.key = _key
        this.inputEvent = new Event(this.name)
    }

    setKey(newKey) {
        key = newKey
    }

    onInput() {
        dispatchEvent(this.inputEvent)
    }
}

class InputManager{
    static inputs
    constructor() {
        this.inputs = []
        addEventListener("keydown", recieveInput)
    }

    static addInput(inputName, inputKey) {
        this.inputs.push(new Input(inputName, inputKey))
    }

    static setInput(inputName, inputKey) {
        this.inputs.find((input) => input.name == inputName).key = inputKey
    }

    static getInput(inputName) {
        return this.inputs.find((input) => input.name == inputName)
    }

    static recieveInput(newInput) {
        this.inputs.find((input) => input.name == newInput).onInput()
    }
}
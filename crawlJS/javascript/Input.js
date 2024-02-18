//Creates an event called through name, which is called with onInput()
class Input {
    constructor(_name, _key) {
        this.name = _name
        this.key = _key
        //Constructs an event with the name of this input
        this.inputEvent = new Event(this.name)
    }

    setKey(newKey) {
        key = newKey
    }

    hasKey(keyToCheck) {
        //Allows for multiple keys to be added to one event
        if(Array.isArray(_key)) {
            return this.key.includes((currentKey) => currentKey == keyToCheck)
        }
        return key == keyToCheck
    }

    //Calls the event created by this input
    onInput() {
        dispatchEvent(this.inputEvent)
    }
}

//Call "addEventListener("keydown", InputMaster.recieveInput)" to recieve key inputs
class InputManager{
    static inputs = []

    //Adds a new input with the name and key
    static addInput(inputName, inputKey) {
        this.inputs.push(new Input(inputName, inputKey))
    }

    //Changes the key cooresponding to the input with that name
    static setInput(inputName, inputKey) {
        this.inputs.find((input) => input.name == inputName).key = inputKey
    }

    //Returns the Input class with this name
    static getInput(inputName) {
        return this.inputs.find((input) => input.name == inputName)
    }

    //When called it checks all inputs to see if they have the key pressed, and if they do, calls their event
    static recieveInput(newInput) {
        this.inputs.find((input) => input.hasKey(newInput)).onInput()
    }
}
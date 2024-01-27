class Log{
    constructor(){
        this.messages = {};
        this.turnCounter = 0;
    }

    addMessage(message){
        if(!this.messages[this.turnCounter]){
            this.messages[this.turnCounter] = [];
        }
        this.messages[this.turnCounter].unshift({
            message:message,
            fresh:true
        });
    }

    printLog(){
        let log = $('#log');
        log.html('');
        for (const [turn, messages] of Object.entries(this.messages)) {
            if(messages){
                messages.forEach((message) => {
                    log.prepend(
                        $('<p>').text("> "+message.message).addClass((message.fresh) ? 'message-fresh' : 'message-old')
                    )
                    message.fresh = false;
                })
                log.prepend(
                    $('<p>').text('Turn '+turn).addClass('turn-counter')
                )
            }
        }
    }

    rewind(){
        let recent = this.peek();
        recent = false;
    }

    peek(){
        return this.messages[this.turnCounter];
    }
}
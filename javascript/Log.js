class Log{
    constructor(){
        this.messages = {};
        this.turnCounter = 0;
    }

    addMessage(message, urgent = false){
        if(!this.messages[this.turnCounter]){
            this.messages[this.turnCounter] = [];
        }
        this.messages[this.turnCounter].unshift({
            message:message,
            fresh:true,
            urgent: urgent
        });
    }

    wipeLog(){
        this.messages = {};
        this.turnCounter = 0;
    }

    printLog(){
        let log = $('#log');
        log.html('');
        for (const [turn, messages] of Object.entries(this.messages)) {
            if(messages){
                messages.forEach((message) => {
                    log.prepend(
                        $('<p>').text("> "+message.message).addClass((message.fresh) ? 'message-fresh' : 'message-old').addClass((message.urgent) ? 'message-urgent' : '')
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
        this.messages[this.turnCounter] = false;
    }

    peek(){
        return this.messages[this.turnCounter];
    }
}
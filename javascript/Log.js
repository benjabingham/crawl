class Log{
    constructor(){
        this.messages = {};
        this.notices = [];
        this.turnCounter = 0;
    }

    addNotice(notice){
        this.notices.unshift(notice);
    }

    clearNotices(){
        this.notices = [];
    }

    addMessage(message, messageClass = false){
        if(!this.messages[this.turnCounter]){
            this.messages[this.turnCounter] = [];
        }
        this.messages[this.turnCounter].unshift({
            message:message,
            fresh:true,
            messageClass: messageClass
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
                        $('<p>').text("> "+message.message).addClass((message.fresh) ? 'message-fresh' : 'message-old').addClass((message.messageClass) ? 'message-'+message.messageClass : '')
                    )
                    message.fresh = false;
                })
                log.prepend(
                    $('<p>').text('Turn '+turn).addClass('turn-counter')
                )
            }
        }

        this.notices.forEach((notice)=>{
            log.prepend(
                $('<p>').text(notice).addClass('notice')
            )
        })
    }

    rewind(){
        this.messages[this.turnCounter] = false;
    }

    peek(){
        return this.messages[this.turnCounter];
    }
}
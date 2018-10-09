/** Copyright Richard Lawson/2018/ xrehash@gmail.com */
//* thing.js

import { Book } from "./core.js";

export class Thing{
    constructor(title,inflate){
        if(title instanceof Thing||inflate){
            let thing = title;
            this.title = thing.title;
            this.created = thing.created;
            this.status = ko.observable(thing.status);
            this.dateDone = thing.dateDone;
            this.dueDate  = thing.dueDate;
            this.id = thing.id;  
        }else{
        this.id = Date.now();
        this.title = title;
        this.created = new Date();
        this.status = ko.observable(Thing.StatusAllowed.NEW);
        this.dateDone = "";
        this.dueDate = new Date(this.created.getFullYear(),
            this.created.getMonth(),
            this.created.getDay()+1);
        }
    }
    get Title(){
        return this.title;
    }

    get Status(){
        return this.status;
    }
    set Status(status){
        this.status = status;
    }
    markDone(){
        this.dateDone = new Date();
        this.status(Thing.StatusAllowed.DONE);
    }
    start(){
        if(this.Status() != Thing.StatusAllowed.DONE){
            this.status(Thing.StatusAllowed.IP);
        }
    }
    pause(){
        switch(this.Status()){
            case Thing.StatusAllowed.IP:
            case Thing.StatusAllowed.UNDONE:
                this.status(Thing.StatusAllowed.PAUSE);
        }
    }

    playPauseClick(data){
        switch(this.Status()){
            case Thing.StatusAllowed.IP:
            case Thing.StatusAllowed.UNDONE:
                this.pause();
                break;
            case Thing.StatusAllowed.PAUSE:
            case Thing.StatusAllowed.NEW:
            case Thing.StatusAllowed.UNDONE:
                this.start();
                break;
        }
    }
    completeItemClick(data){
        if(this.Status() == Thing.StatusAllowed.DONE ){
            this.Status(Thing.StatusAllowed.UNDONE);
        }else{
            this.markDone();
        }
       // console.log(data);
    }
};
Thing.StatusAllowed = {NEW:"New",IP:"In-Progress",PAUSE:'Paused',DONE:"Done",UNDONE:'Un-Done'};

export class ThingList extends Thing{
    constructor(title,inflate){
        var lst = [];
        if(title instanceof Thing||inflate){
            //we clone thing
            let thing = title;
            super(thing.title);
            this.created = thing.created;
            this.status = ko.observable(thing.status);
            this.dateDone = thing.dateDone;
            this.dueDate  = thing.dueDate;
            this.id = thing.id;
            if(thing.items)
                thing.items.forEach(function(x){
                if(x.items){
                    lst.push(new ThingList(x,true));
                }else{
                    lst.push(new Thing(x,true));
                }
            });
        }else{
            super(title);           
        }
        this.items = ko.observableArray(lst);
    }
    get self(){
        return this;
    }
    add(item){
        if(item instanceof Thing){
            this.items.push(item);
        }
    }
    get Items(){
        return this.items();
    }
    promptItem(data){
        //console.log(data);
        if(data instanceof ThingList){
            this.add(new Thing("book " + String.fromCharCode(65+25*Math.random())));
        }
    };
    trashItem(data,p){
        //console.log(data,p);
        data.items.remove(p);
    }
    makeListClick(data,next,op){
        //console.log(self,data,this,next,op)
        if(data instanceof ThingList && next instanceof Thing){
            data.items.remove(next);
            data.add(new ThingList(next));
        }
    }
}

export const OnMark = function(){
   

        var contents = ko.observableArray([/*new ThingList("Yesterday"),new ThingList("Today")*/]);
        this.lists = contents;
        var self = this;

        var book = new Book( function(book){
            //console.log("book call back",book);
            self.book = book;
            self.book.SavedLists(function(lst){
                console.log("Peep",lst);
                lst.forEach(function(d){
                    contents.push(new ThingList(d,true));
                });
            });
        });        
        this.book = book;//.init();
               
    

    self.Lists = function(){
        return this.lists();
    }
    self.addList = function(){
        this.lists.push(new ThingList("Balloon"));
    }
    self.removeList = function(data,p){
        //console.log(this,data,p);
        data.lists.remove(p);
    }
    self.saveList = function(data,p){
        console.log("1:",self);
        self.book.SaveAList(p,function(){console.log(p.Title + "saved.")});
    }
  
}

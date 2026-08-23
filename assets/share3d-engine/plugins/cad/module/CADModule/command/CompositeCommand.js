import * as __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__ from "../../core/Command.js";
class CompositeCommand extends __WEBPACK_EXTERNAL_MODULE__core_Command_js_ab052390__.Command {
    constructor(commands){
        super(), this.commands = commands;
    }
    execute() {
        this.commands.forEach((command)=>command.execute());
    }
    undo() {
        this.commands.forEach((command)=>command.undo());
    }
}
export { CompositeCommand };

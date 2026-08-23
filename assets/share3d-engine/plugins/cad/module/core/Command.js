class Command {
    redo() {
        this.execute();
    }
    canCommit() {
        return true;
    }
}
export { Command };

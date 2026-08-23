var FrameSelect_rslib_entry_FrameSelectMode = /*#__PURE__*/ function(FrameSelectMode) {
    FrameSelectMode["L2R"] = "L2R";
    FrameSelectMode["R2L"] = "R2L";
    return FrameSelectMode;
}({});
class FrameSelect {
    constructor(handlers, options = {}){
        this.handlers = handlers;
        this.isDragging = false;
        this.dragStart = null;
        this.dragEnd = null;
        this.parent = null;
        this.selectBoxEl = null;
        this.dragHoverEntities = new Set();
        this.dragHoverFrameId = null;
        this.dragThreshold = options.threshold ?? 4;
    }
    get isFraming() {
        return this.isDragging;
    }
    mount(parent) {
        this.parent = parent;
        if (this.selectBoxEl) {
            this.selectBoxEl.remove();
            this.parent.appendChild(this.selectBoxEl);
        }
    }
    unmount() {
        this.selectBoxEl?.remove();
        this.parent = null;
    }
    onMouseMove(params) {
        const { event, screenPos } = params;
        const leftPressed = (1 & event.buttons) === 1;
        if (leftPressed) {
            if (!this.dragStart) this.dragStart = {
                x: screenPos.x,
                y: screenPos.y
            };
            if (!this.isDragging && this.dragStart) {
                const dx = screenPos.x - this.dragStart.x;
                const dy = screenPos.y - this.dragStart.y;
                if (Math.hypot(dx, dy) >= this.dragThreshold) {
                    this.isDragging = true;
                    this.dragEnd = {
                        x: screenPos.x,
                        y: screenPos.y
                    };
                    this.ensureSelectBox();
                    this.updateSelectBox();
                }
            } else if (this.isDragging) {
                this.dragEnd = {
                    x: screenPos.x,
                    y: screenPos.y
                };
                this.updateSelectBox();
                this.scheduleDragHover();
            }
        } else if (this.isDragging) {
            this.dragEnd = this.dragEnd || {
                x: screenPos.x,
                y: screenPos.y
            };
            this.finishDragSelect();
        } else {
            this.dragStart = null;
            this.updateDragHover([]);
        }
    }
    cancel() {
        this.isDragging = false;
        this.dragStart = null;
        this.dragEnd = null;
        this.cancelScheduledDragHover();
        this.updateDragHover([]);
        if (this.selectBoxEl) {
            this.selectBoxEl.remove();
            this.selectBoxEl = null;
        }
    }
    ensureSelectBox() {
        if (this.selectBoxEl) return;
        const el = document.createElement('div');
        el.style.position = 'absolute';
        el.style.border = '1px dashed #1e90ff';
        el.style.background = 'rgba(30, 144, 255, 0.12)';
        el.style.pointerEvents = 'none';
        el.style.left = '0px';
        el.style.top = '0px';
        el.style.width = '0px';
        el.style.height = '0px';
        el.style.zIndex = '10';
        this.selectBoxEl = el;
        this.parent?.appendChild(el);
    }
    updateSelectBox() {
        if (!this.selectBoxEl || !this.dragStart || !this.dragEnd) return;
        const left = Math.min(this.dragStart.x, this.dragEnd.x);
        const right = Math.max(this.dragStart.x, this.dragEnd.x);
        const top = Math.min(this.dragStart.y, this.dragEnd.y);
        const bottom = Math.max(this.dragStart.y, this.dragEnd.y);
        const width = Math.max(0, right - left);
        const height = Math.max(0, bottom - top);
        const mode = this.getDragSelectMode();
        if ("L2R" === mode) {
            this.selectBoxEl.style.border = '1px solid #1e90ff';
            this.selectBoxEl.style.background = 'rgba(30, 144, 255, 0.12)';
        } else {
            this.selectBoxEl.style.border = '1px dashed #00cc66';
            this.selectBoxEl.style.background = 'rgba(0, 204, 102, 0.12)';
        }
        this.selectBoxEl.style.left = `${left}px`;
        this.selectBoxEl.style.top = `${top}px`;
        this.selectBoxEl.style.width = `${width}px`;
        this.selectBoxEl.style.height = `${height}px`;
    }
    finishDragSelect() {
        if (!this.dragStart || !this.dragEnd) {
            this.cancel();
            return;
        }
        const rect = this.getDragRect();
        const width = rect.right - rect.left;
        const height = rect.bottom - rect.top;
        if (width >= this.dragThreshold && height >= this.dragThreshold) {
            const mode = this.getDragSelectMode();
            const items = this.getItemsInRect(rect, mode);
            this.handlers.onSelect(items || []);
        }
        this.cancel();
    }
    scheduleDragHover() {
        if (null !== this.dragHoverFrameId) return;
        this.dragHoverFrameId = requestAnimationFrame(()=>{
            this.dragHoverFrameId = null;
            if (this.isDragging) this.updateDragHover();
        });
    }
    cancelScheduledDragHover() {
        if (null === this.dragHoverFrameId) return;
        cancelAnimationFrame(this.dragHoverFrameId);
        this.dragHoverFrameId = null;
    }
    updateDragHover(items) {
        const hovered = items ?? this.getItemsInRect(this.getDragRect(), this.getDragSelectMode());
        const next = new Set(hovered.filter((item)=>item?.id));
        const added = [];
        const removed = [];
        next.forEach((item)=>{
            if (!this.dragHoverEntities.has(item)) added.push(item);
        });
        this.dragHoverEntities.forEach((item)=>{
            if (!next.has(item)) removed.push(item);
        });
        this.dragHoverEntities = next;
        if (added.length) this.handlers.onHoverAdded(added);
        if (removed.length) this.handlers.onHoverRemoved(removed);
    }
    getDragRect() {
        if (!this.dragStart || !this.dragEnd) return {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        };
        const left = Math.min(this.dragStart.x, this.dragEnd.x);
        const right = Math.max(this.dragStart.x, this.dragEnd.x);
        const top = Math.min(this.dragStart.y, this.dragEnd.y);
        const bottom = Math.max(this.dragStart.y, this.dragEnd.y);
        return {
            left,
            right,
            top,
            bottom
        };
    }
    getDragSelectMode() {
        if (!this.dragStart || !this.dragEnd) return "R2L";
        return this.dragEnd.x >= this.dragStart.x ? "L2R" : "R2L";
    }
}
export { FrameSelect, FrameSelect_rslib_entry_FrameSelectMode as FrameSelectMode };

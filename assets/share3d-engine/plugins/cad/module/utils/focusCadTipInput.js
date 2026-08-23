function focusCadTipInput(inputElement, shouldSelect = false) {
    try {
        inputElement.focus({
            preventScroll: true
        });
    } catch  {
        inputElement.focus();
    }
    if (shouldSelect) inputElement.select();
}
export { focusCadTipInput };

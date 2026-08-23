const CAD_TIP_NUMBER_INPUT_CLASS = 'cad-tip-number-input';
const CAD_TIP_NUMBER_INPUT_STYLE_ID = 'cad-tip-number-input-style';
function ensureCadTipNumberInputStyle() {
    if (document.getElementById(CAD_TIP_NUMBER_INPUT_STYLE_ID)) return;
    const styleElement = document.createElement('style');
    styleElement.id = CAD_TIP_NUMBER_INPUT_STYLE_ID;
    styleElement.textContent = `
      .${CAD_TIP_NUMBER_INPUT_CLASS} {
        appearance: textfield;
        -moz-appearance: textfield;
      }

      .${CAD_TIP_NUMBER_INPUT_CLASS}::-webkit-inner-spin-button,
      .${CAD_TIP_NUMBER_INPUT_CLASS}::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    `;
    const parent = document.head ?? document.body ?? document.documentElement;
    parent?.appendChild(styleElement);
}
function styleCadTipNumberInput(inputElement) {
    ensureCadTipNumberInputStyle();
    inputElement.classList.add(CAD_TIP_NUMBER_INPUT_CLASS);
    Object.assign(inputElement.style, {
        width: '30px',
        outline: 'none',
        border: 'none',
        backgroundColor: 'transparent',
        color: '#000'
    });
}
export { styleCadTipNumberInput };

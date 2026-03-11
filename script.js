// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Utility functions for calculation and formatting
    
    const priceInput = document.getElementById('price-input');
    const taxRateInput = document.getElementById('tax-rate');
    const brokerRateInput = document.getElementById('broker-rate');
    
    // Output elements
    const taxAmountSpan = document.getElementById('tax-amount');
    const brokerFeeSpan = document.getElementById('broker-fee');
    const legalFeeSpan = document.getElementById('legal-fee');
    const stampTaxSpan = document.getElementById('stamp-tax');
    
    const totalExtraCostSpan = document.getElementById('total-extra-cost');
    const grandTotalSpan = document.getElementById('grand-total');

    // Sub-values (like bond, certificate, etc)
    const subValues = document.querySelectorAll('.sub-value');
    
    function parseNumber(numStr) {
        if (!numStr) return 0;
        return parseFloat(numStr.replace(/,/g, '')) || 0;
    }

    function formatNumber(num) {
        // Round to whole numbers
        return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Format number input with commas
    priceInput.addEventListener('input', (e) => {
        let val = parseNumber(e.target.value);
        if (e.target.value.trim() === '') {
            e.target.value = '';
            calculate();
            return;
        }
        e.target.value = formatNumber(val);
        calculate();
    });

    [taxRateInput, brokerRateInput].forEach(el => {
        el.addEventListener('input', calculate);
    });

    // Make contenteditable fields recalculate on input
    const editables = document.querySelectorAll('[contenteditable="true"]');
    editables.forEach(el => {
        el.addEventListener('blur', () => {
            // If it's a number field, format it
            if (el.classList.contains('sub-value') || el.id === 'legal-fee' || el.classList.contains('finance-input')) {
                let val = parseNumber(el.innerText);
                el.innerText = formatNumber(val);
            }
            calculate();
            calculateFinance();
        });
        // Prevent enter key adding newlines in simple single line values
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !el.classList.contains('textarea-like') && !el.classList.contains('doc-type') && !el.classList.contains('main-title')) {
                e.preventDefault();
                el.blur();
            }
        });
    });

    function calculate() {
        const price = parseNumber(priceInput.value);
        const taxRate = parseFloat(taxRateInput.value) || 0;
        const brokerRate = parseFloat(brokerRateInput.value) || 0;

        // Automatically calculated based on rates
        const taxAmount = price * (taxRate / 100);
        const brokerFee = price * (brokerRate / 100);

        // Update spans only if they are not actively being edited? 
        // We will just override them on calculation to keep consistency.
        taxAmountSpan.innerText = formatNumber(taxAmount);
        brokerFeeSpan.innerText = formatNumber(brokerFee);

        // Sum additional costs
        let extraCost = taxAmount + brokerFee;
        
        // Add legal fee
        extraCost += parseNumber(legalFeeSpan.innerText);

        // Add sub values
        subValues.forEach(el => {
            extraCost += parseNumber(el.innerText);
        });

        // Add to total
        totalExtraCostSpan.innerText = formatNumber(extraCost);
        grandTotalSpan.innerText = formatNumber(price + extraCost);
    }

    // --- Page 4 Financing Calculation ---
    function calculateFinance() {
        const purchasePrice = parseNumber(priceInput.value);
        
        let selfTotal = 0;
        document.querySelectorAll('.finance-input[data-type="self"]').forEach(el => {
            selfTotal += parseNumber(el.innerText);
        });
        
        let debtTotal = 0;
        document.querySelectorAll('.finance-input[data-type="debt"]').forEach(el => {
            debtTotal += parseNumber(el.innerText);
        });

        const grandFinanceTotal = selfTotal + debtTotal;

        document.getElementById('finance-self-total').innerText = formatNumber(selfTotal);
        document.getElementById('finance-debt-total').innerText = formatNumber(debtTotal);
        document.getElementById('finance-grand-total').innerText = formatNumber(grandFinanceTotal);

        const checkSpan = document.getElementById('balance-check');
        if (grandFinanceTotal === purchasePrice) {
            checkSpan.innerText = '금액 일치';
            checkSpan.style.color = '#059669'; // Green
        } else {
            const diff = grandFinanceTotal - purchasePrice;
            const state = diff > 0 ? "초과" : "부족";
            checkSpan.innerText = `${formatNumber(Math.abs(diff))}원 ${state}`;
            checkSpan.style.color = '#e11d48'; // Red
        }
    }

    // Checkbox toggling on click
    document.querySelectorAll('.check-box').forEach(cb => {
        cb.addEventListener('click', function(e) {
            if (this.innerText === '✓') {
                this.innerText = '';
                this.style.color = 'transparent';
            } else {
                this.innerText = '✓';
                this.style.color = 'var(--secondary-color)';
                this.style.borderColor = 'var(--secondary-color)';
            }
        });
    });

    // Initial calculation
    calculate();
    calculateFinance();
});

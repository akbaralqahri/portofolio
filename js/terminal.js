// Terminal Boot Sequence
class TerminalBoot {
    constructor() {
        this.container = document.getElementById('terminal-loader');
        this.textContainer = document.getElementById('terminal-text');
        this.lines = [
            { text: 'Initializing MAA System Core...', class: '' },
            { text: 'Loading Neural Networks... [OK]', class: 'success' },
            { text: 'Connecting to Data Modules... [OK]', class: 'success' },
            { text: 'Verifying ML Models... [OK]', class: 'success' },
            { text: 'Optimizing UI/UX Elements... [OK]', class: 'success' },
            { text: 'System Ready. Access Granted.', class: 'success' }
        ];
        this.delay = 400; // time between lines
    }

    start() {
        if (!this.container || !this.textContainer) {
            // Fallback if elements not found
            const loader = document.querySelector('.loader-wrapper');
            if (loader) loader.classList.add('hidden');
            return;
        }
        
        let index = 0;
        
        const typeLine = () => {
            if (index < this.lines.length) {
                const line = this.lines[index];
                const div = document.createElement('div');
                div.className = `terminal-line ${line.class}`;
                div.textContent = `> ${line.text}`;
                this.textContainer.appendChild(div);
                index++;
                
                // Randomize delay slightly for realism
                setTimeout(typeLine, this.delay + (Math.random() * 200 - 100));
            } else {
                // Finished
                setTimeout(() => {
                    this.container.classList.add('hidden');
                    setTimeout(() => {
                        this.container.style.display = 'none';
                    }, 500);
                }, 1000);
            }
        };

        // Start typing
        setTimeout(typeLine, 500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const terminal = new TerminalBoot();
    terminal.start();
});

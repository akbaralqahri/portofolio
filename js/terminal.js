// Terminal Boot Sequence
class TerminalBoot {
    constructor() {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        
        this.container = document.getElementById('terminal-loader');
        this.textContainer = document.getElementById('terminal-text');
        this.lines = [
            { text: 'Mengumpulkan sisa kewarasan buat cari kerja... [LOADING]', class: '' },
            { text: 'Menurunkan ekspektasi... [BERES]', class: 'success' },
            { text: 'Update simulasi kapan bisa pensiun dini... [ON TRACK]', class: 'success' },
            { text: 'Info loker remote data analyst di indo... [NOT FOUND]', class: 'success' },
            { text: 'Work life balance check... [NOT FOUND - RETRYING]', class: 'success' },
            { text: 'Sistem berjalan. Tolong jangan ganggu setelah jam 5.', class: 'success' }
        ];
        this.delay = 1000; // time between lines
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
                    window.scrollTo(0, 0); // Force scroll to top so it looks perfect
                    this.container.classList.add('hidden');
                    document.body.classList.add('loaded'); // Trigger entrance animations
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

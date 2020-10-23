const Engine = function(time_step, update, render) {

    this.accumulated_time = 0; // Czas, który upłynął od ostatniej aktualizacji.
    this.animation_frame_request = undefined, // referencja do AFR
        this.time = undefined, // Najnowszy znacznik czasu wykonania pętli.
        this.time_step = time_step, // 1000/30 = 30 klatek na sekundę

        this.updated = false; // Czy funkcja aktualizacji została wywołana od ostatniego cyklu.

    this.update = update; // Funkcja aktualizacji
    this.render = render; // Funckja renderująca

    this.run = function(time_stamp) { // To jest jeden cykl pętli gry

        this.accumulated_time += time_stamp - this.time;
        this.time = time_stamp;

        /* Jeśli urządzenie jest zbyt wolne, aktualizacje mogą zająć więcej czasu niż nasz przedział czasu. Gdyby
         tak jest, może to spowodować zawieszenie gry i przeciążenie procesora. Aby temu zapobiec,
         Wcześnie łapiemy spiralę pamięci i nigdy nie pozwalamy, aby bez niej były trzy pełne klatki
         aktualizacja. Nie jest to idealne rozwiązanie, ale przynajmniej użytkownik nie zawiesi swojego procesora. */
        if (this.accumulated_time >= this.time_step * 3) {

            this.accumulated_time = this.time_step;

        }

        /* Ponieważ możemy aktualizować tylko wtedy, gdy ekran jest gotowy do rysowania i requestAnimationFrame
         wywołuje funkcję run, musimy śledzić, ile czasu minęło. My
         przechowywać zgromadzony czas i sprawdzić, czy upłynęło wystarczająco dużo czasu, aby uzasadnić
         aktualizacja. Pamiętaj, że chcemy aktualizować za każdym razem, gdy zgromadziliśmy jeden krok czasu
         wartości czasu, a jeśli nagromadziło się wiele kroków czasowych, musimy zaktualizować jeden
         czas, aby każdy z nich był na bieżąco. */
        while (this.accumulated_time >= this.time_step) {

            this.accumulated_time -= this.time_step;

            this.update(time_stamp);

            this.updated = true; // Jeśli gra została zaktualizowana, musimy ją ponownie narysować.

        }

        /* Dzięki temu możemy rysować tylko po zaktualizowaniu gry. */
        if (this.updated) {

            this.updated = false;
            this.render(time_stamp);

        }

        this.animation_frame_request = window.requestAnimationFrame(this.handleRun);

    };

    this.handleRun = (time_step) => { this.run(time_step); };

};

Engine.prototype = {

    constructor: Engine,

    start: function() {

        this.accumulated_time = this.time_step;
        this.time = window.performance.now();
        this.animation_frame_request = window.requestAnimationFrame(this.handleRun);

    },

    stop: function() { window.cancelAnimationFrame(this.animation_frame_request); }

};
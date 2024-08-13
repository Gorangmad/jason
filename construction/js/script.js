<script src="https://unpkg.com/swiper@7/swiper-bundle.min.js"></script>


document.addEventListener('DOMContentLoaded', () => {
   const hamburger = document.getElementById('hamburger');
   const navbar = document.getElementById('navbar');

   hamburger.addEventListener('click', () => {
       navbar.classList.toggle('active');
   });

   const cards = document.querySelectorAll(".card");

   cards.forEach((card) => {
       const observer = new IntersectionObserver(
           ([e]) => e.target.classList.toggle("stuck", e.intersectionRatio < 1),
           { threshold: [1] }
       );

       observer.observe(card);
   });

   const columns = document.querySelectorAll('.project-column');

  columns.forEach(column => {
    // Duplicate the column's content for seamless looping
    const clone = column.cloneNode(true);
    column.parentNode.appendChild(clone);
  });

  function startScrolling() {
    columns.forEach(column => {
      const totalHeight = column.scrollHeight / 2;

      function step() {
        const currentScroll = column.scrollTop;
        if (currentScroll >= totalHeight) {
          column.scrollTop = 0;
        } else {
          column.scrollTop += 1;
        }
        requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    });
  }

  startScrolling();
});



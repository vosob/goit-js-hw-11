import axios from 'axios';
import queryString from 'query-string';
import Notiflix from 'notiflix';

const PER_PAGE = 40;

let page = 1;
let q = '';
let total = 0;
let isLoading = false;
let isLastFetched = false;

const refs = {
  form: document.getElementById('search-form'),
  searchInput: document.querySelector('form input'),
  gallery: document.querySelector('.gallery'),
  loadMoreButton: document.querySelector('.load-more'),
};

const getCard = ({ webformatURL, likes, views, comments, downloads }) => {
  return `
    <div class="photo-card">
      <img src="${webformatURL}" alt="" loading="lazy" />
        <div class="info">
          <p class="info-item">
              <b>Likes: ${likes}</b>
          </p>
          <p class="info-item">
              <b>Views: ${views}</b>
          </p>
          <p class="info-item">
              <b>Comments: ${comments}</b>
          </p>
          <p class="info-item">
              <b>Downloads: ${downloads}</b>
          </p>
      </div>
    </div>
    `;
};

const renderCards = hits => {
  const html = hits.map(getCard).join('');
  refs.gallery.innerHTML = html;
};

const appeandCards = hits => {
  const html = hits.map(getCard).join('');
  refs.gallery.innerHTML += html;
};

// const showLoadMore = () => {
//   refs.loadMoreButton.classList.remove('hidden');
// };

// const hideLoadMore = () => {
//   refs.loadMoreButton.classList.add('hidden');
// };

const scrollIntoHead = pos => {
  setTimeout(() => {
    const newCard = refs.gallery.children[pos];
    if (newCard) {
      newCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 0);
};

const loadData = (q, page) => {
  if (!q)
    throw new Erorr("Помилка: параметр 'q' не визначено або має значення null");
  isLoading = true;

  const url = queryString.stringifyUrl({
    url: 'https://pixabay.com/api',
    query: {
      q,
      page,
      key: '39347211-5080f64175fc5e961a62f5c8b',
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: PER_PAGE,
    },
  });

  return axios
    .get(url)
    .then(({ data }) => {
      total += data.hits.length;
      if (data.totalHits === 0) {
        Notiflix.Notify.warning(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
      return data;
    })
    .catch(error => {
      console.log('error: ', error);
      return null;
    })
    .finally(() => {
      isLoading = false;
    });
};

const loadMore = () => {
  page += 1;

  const currenLast = total;

  loadData(q, page).then(({ totalHits, hits }) => {
    scrollIntoHead(currenLast + 1);

    appeandCards(hits);
    console.log({ total, totalHits });
    if (total >= totalHits) {
      // hideLoadMore();
      isLastFetched = true;
      Notiflix.Notify.warning(
        `We're sorry, but you've reached the end of search results.`
      );
    }
  });
};

const submitHandler = e => {
  e.preventDefault();
  q = refs.searchInput.value;

  if (!q) return;

  total = 0;
  page = 1;
  isLastFetched = false;
  // hideLoadMore();
  loadData(q, page).then(({ totalHits, hits }) => {
    renderCards(hits);
    if (totalHits) {
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    }

    isLastFetched = totalHits < PER_PAGE;
    // if (totalHits > PER_PAGE) {
    //   showLoadMore();
    // }
  });
};

refs.form.onsubmit = submitHandler;

refs.loadMoreButton.onclick = loadMore;

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const shouldLoadMore =
      entry.isIntersecting && !isLoading && total && !isLastFetched;
    if (shouldLoadMore) loadMore();
  });
});

observer.observe(refs.loadMoreButton);

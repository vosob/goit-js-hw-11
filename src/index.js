import Notiflix from 'notiflix';
import { total, isLoading, loadData, PER_PAGE } from './js/api';
import { renderCards, appeandCards, refs as renderRefs } from './js/render';

let page = 1;
let q = '';

let isLastFetched = false;

const refs = {
  form: document.getElementById('search-form'),
  searchInput: document.querySelector('form input'),
  gallery: renderRefs.gallery,
  loadMoreButton: document.querySelector('.load-more'),
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

const loadMore = async () => {
  page += 1;

  const currenLast = total;

  const response = await loadData(q, page);
  if (response === null) {
    return;
  }
  scrollIntoHead(currenLast + 1);

  appeandCards(response.hits);

  if (total >= response.totalHits) {
    // hideLoadMore();
    isLastFetched = true;
    Notiflix.Notify.warning(
      `We're sorry, but you've reached the end of search results.`
    );
  }
};

const submitHandler = async e => {
  e.preventDefault();
  q = refs.searchInput.value;

  if (!q) return;

  page = 1;
  isLastFetched = false;

  // hideLoadMore();

  const response = await loadData(q, page, true);
  if (response === null) {
    return;
  }
  renderCards(response.hits);
  if (response.totalHits) {
    Notiflix.Notify.success(`Hooray! We found ${response.totalHits} images.`);
  }

  isLastFetched = response.totalHits < PER_PAGE;
  // if (totalHits > PER_PAGE) {
  //   showLoadMore();
  // }
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

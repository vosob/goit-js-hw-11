import axios from 'axios';
import queryString from 'query-string';
import Notiflix from 'notiflix';

export let total = 0;
export let isLoading = false;
export const PER_PAGE = 40;

export const loadData = async (q, page, resetTotal) => {
  if (!q)
    throw new Erorr("Помилка: параметр 'q' не визначено або має значення null");
  if (resetTotal) {
    total = 0;
  }
  isLoading = true;

  const url = queryString.stringifyUrl({
    url: 'https://pixabay.com/api/',
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

  try {
    const { data } = await axios.get(url);

    total += data.hits.length;
    if (data.totalHits === 0) {
      Notiflix.Notify.warning(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    return data;
  } catch (erorr) {
    Notiflix.Notify.failure('Error');
    console.log(erorr);
    return null;
  } finally {
    isLoading = false;
  }
};

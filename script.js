// Remo North Post — simple blog powered by JSON files.
// To add a new post later:
//   1. Create posts/<your-slug>.json with the same shape as
//      posts/onabowu-summer-coaching-2026.json
//   2. Add one entry for it to posts/index.json

const app = document.getElementById('app');

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

async function loadIndex() {
  const res = await fetch('posts/index.json');
  if (!res.ok) throw new Error('Could not load posts/index.json');
  return res.json();
}

async function loadPost(id) {
  const res = await fetch(`posts/${id}.json`);
  if (!res.ok) throw new Error(`Could not load posts/${id}.json`);
  return res.json();
}

function renderHome(posts) {
  if (posts.length === 0) {
    app.innerHTML = '<p class="empty-state">No stories yet — add one to posts/index.json.</p>';
    return;
  }

  const featured = posts.find(p => p.featured) || posts[0];
  const rest = posts.filter(p => p.id !== featured.id);

  const leadHtml = `
    <article class="lead-story">
      <p class="category-marker">${featured.category}</p>
      <h1>${featured.title}</h1>
      <p class="excerpt">${featured.excerpt}</p>
      <p class="byline">${featured.author} &middot; ${formatDate(featured.date)}</p>
      <img src="${featured.image}" alt="${featured.title}" />
      <a class="read-link" href="#/post/${featured.id}">Read the full story</a>
    </article>
  `;

  const restHtml = rest.length === 0 ? '' : `
    <h2 class="story-list-heading">More stories</h2>
    ${rest.map(p => `
      <a class="story-item" href="#/post/${p.id}">
        <span class="marker category-${p.category}"></span>
        <span class="content">
          <h2>${p.title}</h2>
          <p>${p.excerpt}</p>
          <p class="byline">${p.author} &middot; ${formatDate(p.date)}</p>
        </span>
      </a>
    `).join('')}
  `;

  app.innerHTML = leadHtml + restHtml;
}

function renderArticle(post) {
  app.innerHTML = `
    <article class="article">
      <a class="back-link" href="#/">&larr; Back to all stories</a>
      <p class="category-marker">${post.category}</p>
      <h1>${post.title}</h1>
      ${post.subtitle ? `<p class="subtitle">${post.subtitle}</p>` : ''}
      <p class="byline">${post.author} &middot; ${formatDate(post.date)}${post.location ? ' &middot; ' + post.location : ''}</p>
      <img src="${post.image}" alt="${post.title}" />
      ${post.imageCaption ? `<p class="image-caption">${post.imageCaption}</p>` : ''}
      <div class="body">
        ${post.body.map(paragraph => `<p>${paragraph}</p>`).join('')}
      </div>
      ${post.gallery ? `
        <div class="gallery">
          ${post.gallery.map(item => `
            <figure>
              <img src="${item.src}" alt="${item.caption || ''}" loading="lazy" />
              <figcaption>${item.caption || ''}</figcaption>
            </figure>
          `).join('')}
        </div>
      ` : ''}
    </article>
  `;
  window.scrollTo(0, 0);
}

function renderError(message) {
  app.innerHTML = `<p class="empty-state">${message}</p>`;
}

async function route() {
  const hash = window.location.hash;
  const postMatch = hash.match(/^#\/post\/(.+)$/);

  try {
    if (postMatch) {
      const post = await loadPost(postMatch[1]);
      renderArticle(post);
    } else {
      const posts = await loadIndex();
      renderHome(posts);
    }
  } catch (err) {
    renderError('Something went wrong loading this page. If you are opening this file directly (file://), run it through a local server or deploy it — fetching JSON files needs http(s).');
    console.error(err);
  }
}

window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', route);

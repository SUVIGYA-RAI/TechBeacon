// NewsAPI configuration

const API_KEY = 'b7ae41fbd74a4c90955f61d14dd5acb7';
const BASE_URL = 'https://newsapi.org/v2';

// State management
let currentPage = 1;
let currentCategory = 'all';
let articlesPerPage = 9;
let allArticles = [];
let filteredArticles = [];
let isLoading = false;

// DOM Elements
const newsGrid = document.getElementById('news-grid');
const loadMoreBtn = document.getElementById('load-more');
const loadingIndicator = document.getElementById('loading');
const categoryButtons = document.querySelectorAll('.category-btn');
const searchBtn = document.getElementById('search-btn');
const searchBar = document.getElementById('search-bar');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');


document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupEventListeners();
});


async function initApp() {
  showLoading();
  await fetchNews();
  displayFeaturedArticle();
  displayNewsGrid();
  hideLoading();
}

// Set up event listeners
function setupEventListeners() {
  
  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      
      categoryButtons.forEach(btn => {
        btn.classList.remove('bg-teal-600', 'text-white');
        btn.classList.add('bg-gray-200');
      });
      button.classList.remove('bg-gray-200');
      button.classList.add('bg-teal-600', 'text-white');
      
     
      currentCategory = button.dataset.category;
      currentPage = 1;
      filterArticles();
      displayNewsGrid();
    });
  });

  
  loadMoreBtn.addEventListener('click', () => {
    currentPage++;
    displayNewsGrid();
  });

  
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

  
  searchBtn.addEventListener('click', () => {
    searchBar.classList.toggle('hidden');
  });
}

async function fetchNews() {
  try {
    const techResponse = await fetch(`${BASE_URL}/top-headlines?category=technology&language=en&pageSize=50&apiKey=${API_KEY}`);
    if (!techResponse.ok) throw new Error('Failed to fetch technology news');
    const techData = await techResponse.json();
    
    const businessResponse = await fetch(`${BASE_URL}/top-headlines?category=business&language=en&pageSize=20&apiKey=${API_KEY}`);
    if (!businessResponse.ok) throw new Error('Failed to fetch business news');
    const businessData = await businessResponse.json();
    
    const scienceResponse = await fetch(`${BASE_URL}/top-headlines?category=science&language=en&pageSize=20&apiKey=${API_KEY}`);
    if (!scienceResponse.ok) throw new Error('Failed to fetch science news');
    const scienceData = await scienceResponse.json();
    
    // Combine all articles
    const allFetchedArticles = [...techData.articles, ...businessData.articles, ...scienceData.articles];
    
    
    allArticles = allFetchedArticles
      .filter(article => article.urlToImage)
      .map(article => {
        // Tag articles with categories
        const title = article.title.toLowerCase();
        const description = article.description ? article.description.toLowerCase() : '';
        
        const categories = ['technology']; // Default category
        
        if (title.includes('ai') || title.includes('artificial intelligence') || 
            description.includes('ai') || description.includes('machine learning')) {
          categories.push('ai');
        }
        
        if (title.includes('startup') || title.includes('fund') || 
            description.includes('startup') || description.includes('venture')) {
          categories.push('startup');
        }
        
        return { ...article, categories };
      });
    
    
    allArticles.sort(() => Math.random() - 0.5);
    
    
    filterArticles();
  } catch (error) {
    console.error('Error fetching news:', error);
    showErrorMessage('Failed to load news. Please try again later.');
    
    
    loadDummyData();
  }
}


function filterArticles() {
  if (currentCategory === 'all') {
    filteredArticles = [...allArticles];
  } else {
    filteredArticles = allArticles.filter(article => 
      article.categories.includes(currentCategory)
    );
  }
  
  
  if (filteredArticles.length <= articlesPerPage) {
    loadMoreBtn.classList.add('hidden');
  } else {
    loadMoreBtn.classList.remove('hidden');
  }
}


function displayFeaturedArticle() {
  if (allArticles.length === 0) return;
  
  const featured = allArticles[0];
  
  document.getElementById('featured-title').textContent = featured.title;
  document.getElementById('featured-desc').textContent = featured.description || 'Click to read the full story about this breaking tech news.';
  document.getElementById('featured-source').textContent = featured.source.name;
  document.getElementById('featured-time').innerHTML = `<i class="far fa-clock mr-1"></i> ${formatDate(featured.publishedAt)}`;
  document.getElementById('featured-image').src = featured.urlToImage;
  document.getElementById('featured-image').alt = featured.title;
  document.getElementById('featured-link').href = featured.url;
}


function displayNewsGrid() {
  if (currentPage === 1) {
    newsGrid.innerHTML = '';
  }
  
  const startIndex = (currentPage - 1) * articlesPerPage;
  const endIndex = startIndex + articlesPerPage;
  const articlesToShow = filteredArticles.slice(startIndex, endIndex);
  
  articlesToShow.forEach(article => {
    const card = createNewsCard(article);
    newsGrid.appendChild(card);
  });
  

  if (endIndex >= filteredArticles.length) {
    loadMoreBtn.classList.add('hidden');
  } else {
    loadMoreBtn.classList.remove('hidden');
  }
}


function createNewsCard(article) {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-xl shadow-md overflow-hidden transform transition duration-300 hover:shadow-lg hover:-translate-y-1 news-card fade-in';
  
  const formattedDate = formatDate(article.publishedAt);
  
  card.innerHTML = `
    <div class="img-wrapper h-48">
      <img src="${article.urlToImage || 'https://placehold.co/800x500/0f766e/FFFFFF/png?text=No+Image+Available'}" 
           alt="${article.title}" 
           class="w-full h-full object-cover">
    </div>
    <div class="p-6">
      <h3 class="font-bold text-lg mb-2 line-clamp-3">${article.title}</h3>
      <p class="text-gray-600 text-sm mb-4 line-clamp-3">${article.description || 'Click to read the full article.'}</p>
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-700">${article.source.name}</span>
        <span class="text-sm text-gray-500">${formattedDate}</span>
      </div>
      <a href="${article.url}" target="_blank" class="mt-4 inline-block text-teal-600 font-medium hover:text-teal-800">Read more →</a>
    </div>
  `;
  
  
  card.addEventListener('click', (e) => {
    
    if (!e.target.closest('a')) {
      window.open(article.url, '_blank');
    }
  });
  
  return card;
}


function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    }
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}


function showLoading() {
  isLoading = true;
  loadingIndicator.classList.remove('hidden');
  loadMoreBtn.classList.add('hidden');
}

function hideLoading() {
  isLoading = false;
  loadingIndicator.classList.add('hidden');
  if (filteredArticles.length > currentPage * articlesPerPage) {
    loadMoreBtn.classList.remove('hidden');
  }
}


function showErrorMessage(message) {

  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 5000);
}

function loadDummyData() {
  allArticles = [
    {
      title: "New AI Breakthrough Could Revolutionize Healthcare",
      description: "Researchers have developed an AI system that can diagnose diseases with 99% accuracy, potentially transforming healthcare worldwide.",
      publishedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      urlToImage: "https://placehold.co/800x500/0f766e/FFFFFF/png?text=AI+in+Healthcare",
      url: "#",
      source: { name: "TechBeacon" },
      categories: ["technology", "ai"]
    },
    {
      title: "Tech Startup Raises $50M to Combat Climate Change",
      description: "A promising new startup has secured major funding to scale their carbon capture technology, aiming to make a significant impact on climate change.",
      publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      urlToImage: "https://placehold.co/800x500/0f766e/FFFFFF/png?text=Green+Tech+Startup",
      url: "#",
      source: { name: "Startup Insider" },
      categories: ["technology", "startup"]
    },
    {
      title: "Quantum Computing Reaches Major Milestone",
      description: "Scientists have achieved quantum supremacy with a new 128-qubit processor, solving problems previously thought impossible.",
      publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      urlToImage: "https://placehold.co/800x500/0f766e/FFFFFF/png?text=Quantum+Computing",
      url: "#",
      source: { name: "Science Daily" },
      categories: ["technology"]
    },
    {
      title: "New Cybersecurity Threat Targets Remote Workers",
      description: "Security experts warn of a sophisticated phishing campaign targeting remote workers. Here's how to protect yourself.",
      publishedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      urlToImage: "https://placehold.co/800x500/0f766e/FFFFFF/png?text=Cybersecurity",
      url: "#",
      source: { name: "Security News" },
      categories: ["technology"]
    },
    {
      title: "Tech Giants Announce Joint AI Ethics Board",
      description: "Major technology companies have formed an independent ethics committee to address concerns about artificial intelligence development.",
      publishedAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
      urlToImage: "https://placehold.co/800x500/0f766e/FFFFFF/png?text=AI+Ethics",
      url: "#",
      source: { name: "Tech Today" },
      categories: ["technology", "ai"]
    },
    {
      title: "Revolutionary Battery Technology Triples EV Range",
      description: "A startup has developed a new battery technology that could triple the range of electric vehicles and dramatically reduce charging time.",
      publishedAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
      urlToImage: "https://placehold.co/800x500/0f766e/FFFFFF/png?text=EV+Battery+Tech",
      url: "#",
      source: { name: "EV News" },
      categories: ["technology", "startup"]
    }
  ];
  

  for (let i = 0; i < 12; i++) {
    allArticles.push({
      title: `Tech News Article ${i+7}`,
      description: "This is a placeholder article since we couldn't connect to the news API.",
      publishedAt: new Date(Date.now() - (i+6) * 86400000).toISOString(),
      urlToImage: `https://placehold.co/800x500/0f766e/FFFFFF/png?text=Tech+News+${i+7}`,
      url: "#",
      source: { name: "TechBeacon" },
      categories: ["technology", i % 3 === 0 ? "ai" : (i % 3 === 1 ? "startup" : "technology")]
    });
  }
  
  filterArticles();
}
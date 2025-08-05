# Templecurraheen Graveyard Documentation Website

A static website documenting the historical heritage of Templecurraheen Graveyard, built with Eleventy and Tailwind CSS.

## 🏗️ Features

- **Responsive Design**: Mobile-first design that works on all devices
- **Static Site Generation**: Fast, secure, and SEO-friendly using Eleventy
- **Burial Records Database**: Searchable and sortable burial records
- **Photo Gallery**: Organized gallery with filtering and lightbox functionality
- **Individual Grave Pages**: Detailed pages for each burial record
- **Modern Styling**: Clean, accessible design using Tailwind CSS
- **GitHub Pages Deployment**: Automatic deployment via GitHub Actions

## 🚀 Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/templecurraheen-graveyard.git
   cd templecurraheen-graveyard
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. Open your browser to `http://localhost:8080`

### Building for Production

```bash
npm run build
```

The built site will be in the `_site` directory.

## 📁 Project Structure

```
website/
├── src/                    # Source files
│   ├── _data/             # Data files (JSON, JS)
│   ├── _includes/         # Reusable components
│   ├── _layouts/          # Page layouts
│   ├── css/               # Stylesheets
│   ├── graves/            # Individual grave pages
│   ├── burials/           # Burial list page
│   ├── gallery/           # Photo gallery
│   ├── about/             # About page
│   └── index.md           # Homepage
├── assets/                # Static assets
│   └── imgs/              # Images
├── scripts/               # Utility scripts
├── .github/workflows/     # GitHub Actions
└── _site/                 # Generated site (git-ignored)
```

## 📊 Data Management

### Adding Burial Records

#### Method 1: TSV File (Bulk Import)

1. Edit `src/_data/burials.tsv` with burial information
2. Run the conversion script:
   ```bash
   node scripts/convert-tsv-to-md.js
   ```

#### Method 2: Individual Markdown Files

Create new files in `src/graves/` following this format:

```markdown
---
layout: grave.njk
name: "John Doe"
birthDate: "1820-01-01"
deathDate: "1890-12-31"
age: 70
plot: "A-15"
headstoneType: "Celtic Cross"
inscription: "In loving memory"
hasPhoto: true
photos:
  - src: "/assets/imgs/graves/john-doe.jpg"
    alt: "Headstone of John Doe"
    caption: "Celtic cross memorial"
---

Biographical information about John Doe...
```

### Adding Photos

1. Add images to `assets/imgs/graves/` for individual graves
2. Add images to `assets/imgs/gallery/` for the gallery
3. Update `src/_data/gallery.json` for gallery images
4. Reference photos in burial records using the `photos` frontmatter

## 🎨 Customization

### Styling

- Main styles: `src/css/styles.css`
- Tailwind config: `tailwind.config.js`
- Color scheme based on stone/earth tones

### Layout

- Base layout: `src/_layouts/base.njk`
- Grave layout: `src/_layouts/grave.njk`

### Data

- Helper functions: `src/_data/helpers.js`
- Gallery data: `src/_data/gallery.json`
- Burial data: `src/_data/burials.tsv`

## 🚀 Deployment

### GitHub Pages (Automatic)

1. Push to the `main` branch
2. GitHub Actions will automatically build and deploy
3. Site will be available at `https://your-username.github.io/templecurraheen-graveyard`

### Manual Deployment

```bash
npm run deploy
```

## 🤝 Contributing

We welcome contributions to help preserve this important heritage:

### Ways to Contribute

- **Historical Information**: Family records, burial details, dates
- **Photographs**: Historical or contemporary images of headstones
- **Code**: Bug fixes, features, improvements
- **Documentation**: Help improve this documentation

### Submitting Information

- **Email**: Send information to [contact@example.com]
- **GitHub Issues**: [Open an issue](https://github.com/your-username/templecurraheen-graveyard/issues)
- **Pull Requests**: Fork the repo and submit a PR

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `npm start`
5. Submit a pull request

## 📝 Data Format

### Burial Records TSV Format

```
Name	Birth Date	Death Date	Age	Plot	Headstone Type	Inscription	Notes	Photos
John Murphy	1820-03-15	1885-11-22	65	A-12	Celtic Cross	"In loving memory..."	Local shopkeeper	photo.jpg
```

### Gallery JSON Format

```json
{
  "images": [
    {
      "src": "/assets/imgs/gallery/photo.jpg",
      "alt": "Description",
      "title": "Photo Title",
      "description": "Detailed description",
      "category": "headstones|general|historical",
      "date": "2024"
    }
  ]
}
```

## 🛠️ Technologies Used

- **[Eleventy](https://www.11ty.dev/)**: Static site generator
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework
- **[Nunjucks](https://mozilla.github.io/nunjucks/)**: Templating engine
- **[GitHub Pages](https://pages.github.com/)**: Hosting
- **[GitHub Actions](https://github.com/features/actions)**: CI/CD

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Local historians who provided initial research
- Community members who shared family records
- Contributors who helped build and maintain this resource
- The families whose heritage is preserved here

## 📞 Contact

- **Email**: [contact@example.com]
- **GitHub**: [https://github.com/your-username/templecurraheen-graveyard]
- **Issues**: [Report a problem or suggest an improvement](https://github.com/your-username/templecurraheen-graveyard/issues)

---

_This project is dedicated to preserving the memory and heritage of those who rest in Templecurraheen Graveyard._

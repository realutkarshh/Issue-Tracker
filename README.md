# Issue Tracker - Full Stack Application

A modern Issue Tracker built with FastAPI (Python) backend and Angular (TypeScript) frontend, featuring comprehensive CRUD operations, search, filtering, sorting, and pagination capabilities.

## 🚀 Live Demo

- **Frontend:** [Deployed on Vercel](https://issue-tracker-eight-pi.vercel.app/issues)
- **Backend API:** https://issue-tracker-kp69.onrender.com

## ✨ Features

### Backend (FastAPI)
- **RESTful API** with automatic OpenAPI documentation
- **Health Check** endpoint for monitoring
- **CRUD Operations** for issue management
- **Advanced Filtering** by status, priority, and assignee
- **Search Functionality** by title
- **Sorting** by any field (ascending/descending)
- **Pagination** with configurable page size
- **Auto-generated timestamps** (createdAt, updatedAt)

### Frontend (Angular)
- **Responsive Design** with modern UI components
- **Interactive Data Table** with sortable columns
- **Real-time Search** with debounced input
- **Multi-filter Support** with dropdown selectors
- **Pagination Controls** with page size options
- **Modal Forms** for creating and editing issues
- **Issue Detail View** with full JSON display
- **Loading States** and error handling

## 🛠️ Tech Stack

**Backend:**
- Python 3.9+
- FastAPI
- Uvicorn
- Pydantic
- Python-CORS

**Frontend:**
- Angular 16+
- TypeScript
- Tailwind CSS
- Angular Material (optional)
- RxJS

**Deployment:**
- Backend: Render
- Frontend: Vercel

## 📦 Installation & Setup

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/issue-tracker.git
cd issue-tracker/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start development server
ng serve

# Build for production
ng build --prod
```

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check status |
| GET | `/issues` | Get all issues with optional filters |
| GET | `/issues/{id}` | Get single issue by ID |
| POST | `/issues` | Create new issue |
| PUT | `/issues/{id}` | Update existing issue |

### Query Parameters for `/issues`

- `search`: Search by title
- `status`: Filter by status
- `priority`: Filter by priority
- `assignee`: Filter by assignee
- `sort_by`: Sort field
- `sort_order`: `asc` or `desc`
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 10)

## 📱 Screenshots

### Issues List View
![Issues List](


### Issue Detail View
![Issue Detail](screenshots/issue-detail.png/Edit Issue Form
![Issue Form](screenshots/issue-form. Structure

```
issue-tracker/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # Pydantic models
│   ├── database.py          # In-memory database simulation
│   ├── requirements.txt     # Python dependencies
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   └── app.module.ts
│   │   ├── assets/
│   │   └── environments/
│   ├── angular.json
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## 💡 Key Learnings

### FastAPI Backend Development
- RESTful API design principles
- Automatic API documentation with Swagger
- Request/response validation with Pydantic
- CORS configuration for frontend integration
- Deployment on Render platform

### Angular Frontend Development
- Component-based architecture
- TypeScript integration
- Reactive programming with RxJS
- HTTP client for API communication
- Responsive design with Tailwind CSS
- State management for complex UI interactions

### Full-Stack Integration
- API-first development approach
- Environment configuration management
- Cross-origin resource sharing (CORS)
- Production deployment workflows

## 🚀 Deployment

### Backend (Render)
1. Connect GitHub repository to Render
2. Configure environment variables
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Configure build settings for Angular
3. Set environment variables for API URL
4. Deploy with automatic CI/CD

## 🔮 Future Enhancements

- User authentication and authorization
- Real database integration (PostgreSQL/MongoDB)
- File attachments for issues
- Email notifications
- Advanced reporting and analytics
- Mobile responsive improvements
- Real-time updates with WebSockets

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/realutkarshh)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/realutkarshh)

***

⭐ Star this repository if you found it helpful!

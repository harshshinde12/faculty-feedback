# 🎓 Faculty Feedback System

A comprehensive, role-based feedback management system developed for educational institutions. This platform enables seamless collection, analysis, and management of student feedback for faculty members, ensuring privacy and data-driven improvements.

## 🚀 Live Demo
**[https://faculty-feedback-pi.vercel.app](https://faculty-feedback-pi.vercel.app)**

## ✨ Key Features

### 👮 Administrator
*   **User Management**: Create and manage Students, Faculty, and HOD accounts.
*   **Academic Structure**: Configure Departments, Programs, Subjects, and academic relations.
*   **Feedback Configuration**: Create dynamic feedback forms with custom attributes.
*   **Reporting**: Generate institutional reports including NAAC Participation & Satisfaction indices.

### 🎓 HOD (Head of Department)
*   **Department Analytics**: Access detailed feedback summaries for all faculty in the department.
*   **Performance Metrics**: View average ratings, response counts, and subject-wise breakdowns.

### 👨‍🏫 Faculty
*   **Privacy-First Dashboard**: View aggregated feedback statistics (Class Average, Rating Distribution).
*   **Bias Prevention**: Raw student comments and identities are hidden to maintain objectivity.

### 🧑‍🎓 Student
*   **Easy Submission**: View and submit pending feedback forms for current subjects.
*   **Context Aware**: Forms are automatically linked to the correct Subject and Teacher.

## 🛠️ Technology Stack
*   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) with Mongoose v9
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Authentication**: [NextAuth.js](https://next-auth.js.org/)
*   **Deployment**: [Vercel](https://vercel.com/)

## ⚙️ Local Development Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/harshshinde12/faculty-feedback.git
    cd faculty-feedback
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env.local` file in the root directory:
    ```env
    MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/faculty_feedback
    NEXTAUTH_SECRET=your-super-secret-key-123
    NEXTAUTH_URL=http://localhost:3000
    ```

4.  **Seed the Database** (Optional, for test data)
    ```bash
    npx tsx seed.ts
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Deployment

This project is optimized for deployment on **Vercel**.
1.  Import the repository on Vercel.
2.  Add the `MONGODB_URI` and `NEXTAUTH_SECRET` in Environment Variables.
3.  Deploy!

## 🤝 Contribution
1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

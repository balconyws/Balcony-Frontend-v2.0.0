# Balcony

[**Balcony**](https://balcony-web.vercel.app/) is a Next.js application designed to be the ultimate hub for finding customized workspace solutions. Built with modern technologies and best practices, this project offers a seamless user experience with a focus on performance and flexibility.

## Introduction

Balcony leverages the powerful [Next.js](https://nextjs.org/) framework, which allows for server-side rendering and static site generation, ensuring a fast and efficient user experience. This project is built using TypeScript and integrates several libraries to enhance its functionality and performance.

<p align="center">
  <a href="https://nextjs.org">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_dark_background.png">
      <img src="https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_light_background.png" height="128">
    </picture>
    <h1 align="center">Next.js</h1>
  </a>
</p>

## Features

- **Routing**: Utilize Next.js's built-in routing system for seamless page transitions.
- **TypeScript**: Benefit from static typing with TypeScript for better development experience.
- **Tailwind CSS**: Customize the styling of your application with Tailwind CSS for a modern look.
- **Shadcn UI**: A modern UI component library designed for building scalable and customizable user interfaces.
- **Performance Optimization**: Automatically optimize fonts and images to ensure fast load times.
- **Testing**: Implement comprehensive testing using Jest and React Testing Library.
- **Code Formatting & Linting**: Maintain code quality with Prettier and ESLint configurations.
- **Deployment**: Easily deploy your application using Vercel for scalable and reliable hosting.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/AreebGhani/balcony.git
   ```
2. Navigate to the project directory:

   ```bash
   cd balcony
   ```

3. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### Usage
1. Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

2. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

3. You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

### Scripts

1. dev: This script is used to start the development server. You can run it using `npm run dev` or `yarn dev`. It launches the development server and allows you to preview app in a development environment.

3. build: This script is used to build the app and stores the artifacts in the dist directory. You can run it using `npm run build` or `yarn build`.

3. start: This script is used to start the application in production mode. You can run it using `npm start` or `yarn start`.

4. standalone: This script is used to run the application in standalone mode for production. You can run it using `npm run standalone` or `yarn run standalone`.

5. prepare: This script is used for Husky, a tool for Git hooks. It prepares Husky for running pre-commit hooks. It doesn't need to be manually executed, but if you want to run it manually, you can use `npm run prepare` or `yarn prepare`.

6. format: This script formats your code using Prettier. It automatically formats all files in your project. You can run it using `npm run format` or `yarn format`.

7. format:check: Similar to the format script, but it checks if the code needs formatting without actually modifying the files. You can run it using `npm run format:check` or `yarn format:check`.

8. lint: This script checks your code for syntax and style errors using ESLint. It doesn't fix the errors automatically. You can run it using `npm run lint` or `yarn lint`.

9. lint:fix: Similar to the lint script, but it also attempts to fix the errors found by ESLint. You can run it using `npm run lint:fix` or `yarn lint:fix`.

10. test: This script is used for running tests using Jest. You can run it using `npm run test` or `yarn test`.

11. test:watch: This script is used for running tests in watch mode. You can run it using `npm run jest:watch` or `yarn jest:watch`.

12. commit: This script assists in making Git commits by adding files to the staging area and opening a commit message prompt using git-cz. You can run it using `npm run commit` or `yarn commit`.

13. lint-staged:  Runs linters only on staged files to ensure code quality before committing. You can run it using `npm run lint-staged` or `yarn lint-staged`.

### Technologies Used

- Next.js
- TypeScript
- Tailwind CSS
- Shadcn UI
- Prettier
- ESLint
- Jest
- React Testing Library

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Contributing

Contributions are welcome! If you have suggestions or found bugs, please open an issue or create a pull request.

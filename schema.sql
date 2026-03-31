DROP TABLE IF EXISTS feedback;

CREATE TABLE feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  author TEXT,
  content TEXT NOT NULL,
  date TEXT NOT NULL,
  sentiment TEXT,
  theme TEXT,
  priority TEXT
);

INSERT INTO feedback (source, author, content, date, sentiment, theme, priority) VALUES
('discord', 'user_alex', 'The dashboard takes forever to load, its unusable on slow connections', '2024-01-15', 'negative', 'performance', 'high'),
('github', 'dev_maria', 'Workers AI binding documentation is outdated, spent 3 hours debugging', '2024-01-15', 'negative', 'documentation', 'high'),
('twitter', 'startup_joe', 'Cloudflare Workers cold start times are incredible, migrated from AWS Lambda', '2024-01-16', 'positive', 'performance', 'low'),
('support', 'enterprise_amy', 'We need better role-based access control for team accounts', '2024-01-16', 'negative', 'features', 'high'),
('discord', 'hacker_tim', 'D1 database is so easy to set up, love it', '2024-01-17', 'positive', 'developer experience', 'low'),
('github', 'dev_chen', 'R2 pricing is confusing, cant figure out what ill be charged', '2024-01-17', 'negative', 'pricing', 'medium'),
('support', 'user_sarah', 'Login keeps failing on Safari, happening for a week now', '2024-01-18', 'negative', 'bugs', 'high'),
('twitter', 'dev_mike', 'The wrangler CLI is a joy to use, deployment in seconds', '2024-01-18', 'positive', 'developer experience', 'low'),
('discord', 'user_anna', 'Why is there no dark mode? Eyes are burning', '2024-01-19', 'negative', 'UI', 'medium'),
('github', 'dev_lucas', 'Workers AI latency spikes randomly, impossible to debug', '2024-01-19', 'negative', 'performance', 'high'),
('support', 'user_peter', 'Billing page crashes on Firefox every time I open it', '2024-01-20', 'negative', 'bugs', 'high'),
('twitter', 'indie_dev', 'Just shipped my SaaS entirely on Cloudflare stack, zero infra headaches', '2024-01-20', 'positive', 'developer experience', 'low'),
('discord', 'user_nina', 'Error messages are so vague, no idea what went wrong', '2024-01-21', 'negative', 'developer experience', 'medium'),
('github', 'dev_omar', 'Please add support for websockets in Workers, critical for us', '2024-01-21', 'negative', 'features', 'high'),
('support', 'user_lisa', 'Onboarding flow is confusing, took me an hour to deploy my first worker', '2024-01-22', 'negative', 'onboarding', 'medium'),
('twitter', 'user_raj', 'KV storage performance is insane, reads are instant globally', '2024-01-22', 'positive', 'performance', 'low'),
('discord', 'dev_sophie', 'The docs keep linking to deprecated pages, very frustrating', '2024-01-23', 'negative', 'documentation', 'medium'),
('github', 'user_ben', 'D1 query limits are too low for production use cases', '2024-01-23', 'negative', 'pricing', 'high'),
('support', 'user_kate', 'Love the analytics dashboard, most useful feature by far', '2024-01-24', 'positive', 'UI', 'low'),
('twitter', 'dev_james', 'Wrangler error messages need serious improvement, cryptic and unhelpful', '2024-01-24', 'negative', 'developer experience', 'medium');

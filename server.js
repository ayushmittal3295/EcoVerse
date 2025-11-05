const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'pages')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Default route (homepage)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

// MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Root route
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>EcoLearn Server</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
                h1 { color: #2e7d32; }
                .links { margin-top: 30px; }
                a { display: inline-block; margin: 10px; padding: 10px 20px; background: #2e7d32; color: white; text-decoration: none; border-radius: 5px; }
            </style>
        </head>
        <body>
            <h1>EcoLearn Server is Running!</h1>
            <p>Your MySQL backend server is successfully running on port ${port}.</p>
            
            <div class="links">
                <a href="/test">Test API Endpoints</a>
                <a href="/api/test-db">Test Database Connection</a>
            </div>
            
            <div style="margin-top: 40px;">
                <h3>Next Steps:</h3>
                <p>1. Make sure your frontend HTML file is in the same directory as server.js</p>
                <p>2. Update your frontend fetch calls to use http://localhost:3000/api/...</p>
                <p>3. Test the API endpoints using the links above</p>
            </div>
        </body>
        </html>
    `);
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute('SELECT 1 + 1 AS solution');
        connection.release();
        
        res.json({ 
            success: true, 
            message: 'Database connection successful',
            result: rows[0].solution 
        });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Database connection failed',
            error: error.message 
        });
    }
});

// Get user data with all progress types
app.get('/api/user/data', async (req, res) => {
    const { uid } = req.query;
    
    try {
        // Get user basic info
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE uid = ?',
            [uid]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const user = users[0];
        
        // Get user activities
        const [activities] = await pool.execute(
            'SELECT * FROM activities WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
            [user.id]
        );
        
        // Get user badges
        const [badges] = await pool.execute(
            'SELECT * FROM badges WHERE user_id = ? ORDER BY created_at DESC LIMIT 3',
            [user.id]
        );
        
        // Get CURRENT weekly progress
        const currentDate = new Date();
        const startOfWeek = getStartOfWeek(currentDate);
        const weekStartStr = startOfWeek.toISOString().split('T')[0];
        
        const [weeklyProgress] = await pool.execute(
            'SELECT * FROM weekly_progress WHERE user_id = ? AND week_start = ?',
            [user.id, weekStartStr]
        );
        
        let weeklyData = [0, 0, 0, 0, 0, 0, 0];
        
        if (weeklyProgress.length > 0) {
            const progress = weeklyProgress[0];
            weeklyData = [
                progress.monday || 0,
                progress.tuesday || 0,
                progress.wednesday || 0,
                progress.thursday || 0,
                progress.friday || 0,
                progress.saturday || 0,
                progress.sunday || 0
            ];
        }
        
        // Get monthly progress (current month weeks)
        const monthlyData = await getMonthlyProgress(user.id);
        
        // Get yearly progress (last 12 months)
        const yearlyData = await getYearlyProgress(user.id);
        
        console.log(`Progress data for user ${user.id}:`);
        console.log('Weekly:', weeklyData);
        console.log('Monthly:', monthlyData);
        console.log('Yearly:', yearlyData);
        
        // Prepare response
        const userData = {
            points: user.points,
            level: user.level,
            streak: user.streak,
            completedChallenges: user.completed_challenges,
            badges: user.badges,
            treesPlanted: user.trees_planted,
            learningTime: user.learning_time,
            activities: activities,
            badges: badges,
            weeklyProgress: weeklyData,
            monthlyProgress: monthlyData,
            yearlyProgress: yearlyData
        };
        
        res.json(userData);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Helper function to get start of week (Monday)
function getStartOfWeek(date) {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
}

// Helper function to get start of month
function getStartOfMonth(date) {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    return startOfMonth;
}

// Get monthly progress (current month weeks)
async function getMonthlyProgress(userId) {
    try {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        // Get start and end of current month
        const startOfMonth = new Date(currentYear, currentMonth, 1);
        const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
        
        // Get all weekly progress records for current month
        const [monthlyProgress] = await pool.execute(
            `SELECT * FROM weekly_progress 
             WHERE user_id = ? 
             AND week_start >= ? 
             AND week_start <= ?
             ORDER BY week_start`,
            [userId, startOfMonth.toISOString().split('T')[0], endOfMonth.toISOString().split('T')[0]]
        );
        
        // Initialize monthly data with 4 weeks
        const monthlyData = [0, 0, 0, 0];
        
        monthlyProgress.forEach(progress => {
            const weekTotal = (progress.monday || 0) + (progress.tuesday || 0) + 
                             (progress.wednesday || 0) + (progress.thursday || 0) + 
                             (progress.friday || 0) + (progress.saturday || 0) + 
                             (progress.sunday || 0);
            
            // Calculate which week of the month this belongs to
            const weekStart = new Date(progress.week_start);
            const weekOfMonth = getWeekOfMonth(weekStart);
            
            if (weekOfMonth >= 1 && weekOfMonth <= 4) {
                monthlyData[weekOfMonth - 1] = weekTotal;
            }
        });
        
        return monthlyData;
    } catch (error) {
        console.error('Error getting monthly progress:', error);
        return [0, 0, 0, 0];
    }
}

// Helper function to get week of month (1-4)
function getWeekOfMonth(date) {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Adjust for week starting on Monday
    const adjustedFirstDay = (firstDayOfWeek === 0) ? 6 : firstDayOfWeek - 1;
    
    const dayOfMonth = date.getDate();
    return Math.ceil((dayOfMonth + adjustedFirstDay) / 7);
}

// Get yearly progress (last 12 months)
async function getYearlyProgress(userId) {
    try {
        const yearlyData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        
        // Get data for each month of current year
        for (let month = 0; month < 12; month++) {
            const startOfMonth = new Date(currentYear, month, 1);
            const endOfMonth = new Date(currentYear, month + 1, 0);
            
            // Get all weekly progress records for this month
            const [monthlyProgress] = await pool.execute(
                `SELECT * FROM weekly_progress 
                 WHERE user_id = ? 
                 AND week_start >= ? 
                 AND week_start <= ?`,
                [userId, startOfMonth.toISOString().split('T')[0], endOfMonth.toISOString().split('T')[0]]
            );
            
            let monthTotal = 0;
            monthlyProgress.forEach(progress => {
                monthTotal += (progress.monday || 0) + (progress.tuesday || 0) + 
                             (progress.wednesday || 0) + (progress.thursday || 0) + 
                             (progress.friday || 0) + (progress.saturday || 0) + 
                             (progress.sunday || 0);
            });
            
            yearlyData[month] = monthTotal;
        }
        
        return yearlyData;
    } catch (error) {
        console.error('Error getting yearly progress:', error);
        return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
}

// Create new user
app.post('/api/user/create', async (req, res) => {
    const { uid, email, displayName, photoURL } = req.body;
    
    try {
        const [result] = await pool.execute(
            'INSERT INTO users (uid, email, display_name, photo_url) VALUES (?, ?, ?, ?)',
            [uid, email, displayName, photoURL]
        );
        
        res.json({ success: true, userId: result.insertId });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user points with all progress tracking
app.post('/api/user/update-points', async (req, res) => {
    const { uid, points, activity } = req.body;
    
    try {
        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        
        try {
            // Update user points
            await connection.execute(
                'UPDATE users SET points = points + ? WHERE uid = ?',
                [points, uid]
            );
            
            // Add activity
            if (activity) {
                const [user] = await connection.execute(
                    'SELECT id FROM users WHERE uid = ?',
                    [uid]
                );
                
                if (user.length > 0) {
                    await connection.execute(
                        'INSERT INTO activities (user_id, type, title, description, icon, time) VALUES (?, ?, ?, ?, ?, ?)',
                        [user[0].id, activity.type, activity.title, activity.description, 'fa-gamepad', activity.time]
                    );
                }
            }
            
            // Update weekly progress
            const currentDate = new Date();
            const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
            
            // Get the start of the week (Monday)
            const startOfWeek = getStartOfWeek(currentDate);
            const weekStartStr = startOfWeek.toISOString().split('T')[0];
            
            // Map day of week to column names (0=Sunday, 1=Monday, etc.)
            const dayColumns = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayColumn = dayColumns[dayOfWeek];
            
            const [user] = await connection.execute(
                'SELECT id FROM users WHERE uid = ?',
                [uid]
            );
            
            if (user.length > 0) {
                // Check if weekly progress record exists
                const [weeklyProgress] = await connection.execute(
                    'SELECT id FROM weekly_progress WHERE user_id = ? AND week_start = ?',
                    [user[0].id, weekStartStr]
                );
                
                if (weeklyProgress.length > 0) {
                    // Update existing record
                    await connection.execute(
                        `UPDATE weekly_progress SET ${dayColumn} = ${dayColumn} + ? WHERE user_id = ? AND week_start = ?`,
                        [points, user[0].id, weekStartStr]
                    );
                    console.log(`Updated existing ${dayColumn} with ${points} points for week ${weekStartStr}`);
                } else {
                    // Create new record with all days initialized to 0
                    const initialData = {
                        monday: 0, tuesday: 0, wednesday: 0, 
                        thursday: 0, friday: 0, saturday: 0, sunday: 0
                    };
                    initialData[dayColumn] = points;
                    
                    await connection.execute(
                        `INSERT INTO weekly_progress (user_id, monday, tuesday, wednesday, thursday, friday, saturday, sunday, week_start) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [user[0].id, 
                         initialData.monday, initialData.tuesday, initialData.wednesday,
                         initialData.thursday, initialData.friday, initialData.saturday, initialData.sunday,
                         weekStartStr]
                    );
                    console.log(`Created new weekly record with ${dayColumn} = ${points} points for week ${weekStartStr}`);
                }
            }
            
            await connection.commit();
            connection.release();
            
            res.json({ success: true });
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Error updating points:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve test page
app.get('/test', (req, res) => {
    res.sendFile(__dirname + '/test.html');
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Visit http://localhost:${port} to check if it's working`);
});
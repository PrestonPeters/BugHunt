const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const PORT = 8080;

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json());

const db = mysql.createPool({
    host: 'db',
    user: 'root',
    password: 'CMPT353',
    database: 'BugHunt',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    authPlugins: {
        mysql_clear_password: () => () => Buffer.from('CMPT353')
    }
});

async function initialize() {
    async function initializeSequentially() {
        console.log("Initializing...");
        await db.promise().query('CREATE DATABASE IF NOT EXISTS BugHunt');
        await db.promise().query('USE BugHunt');

        // FOR TESTING AND REBUILD PURPOSES
        // await db.promise().query('DROP TABLE IF EXISTS users');
        // await db.promise().query('DROP TABLE IF EXISTS channels');
        // await db.promise().query('DROP TABLE IF EXISTS posts');
        // await db.promise().query('DROP TABLE IF EXISTS likes');
        // await db.promise().query('DROP TABLE IF EXISTS images');
        
        await db.promise().query('CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(24), password VARCHAR(24), channels JSON, posts INT)');
        await db.promise().query('CREATE TABLE IF NOT EXISTS channels (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(32), description TEXT)');
        await db.promise().query('CREATE TABLE IF NOT EXISTS posts (id INT AUTO_INCREMENT PRIMARY KEY, topic VARCHAR(80), data TEXT, username TEXT, channelName TEXT, parent INT, time TEXT)');
        await db.promise().query('CREATE TABLE IF NOT EXISTS likes (postID INT PRIMARY KEY, userLikes JSON, userDislikes JSON)');
        await db.promise().query('CREATE TABLE IF NOT EXISTS images (id INT AUTO_INCREMENT PRIMARY KEY, postID INT, image LONGTEXT, format VARCHAR(4), name TEXT)');

        if ((await db.promise().query('SELECT * FROM users WHERE username = "admin"'))[0].length === 0) {
            await db.promise().query('INSERT INTO users (username, password, channels, posts) VALUES ("admin", "admin", JSON_ARRAY(), 0)');
        }

        console.log("Initialized!");
    }

    async function connectToDatabase() {
        console.log("Connecting to database...");
        db.getConnection((err) => {
            if (!err) {
                console.log("Connected to database!");
                initializeSequentially();
            }

            else {
                console.log("Failed to connect to database. Trying again...");
                setTimeout(connectToDatabase, 2500);
            }
        });
    }

    connectToDatabase();
}

initialize();

app.post('/login', (req, res) => {
    console.log("Logging in...");
    let sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(sql, [req.body.username, req.body.password], async (err, result) => {
        if (err) {
            console.log(err); 
            res.status(424).json({ message: 'Login failed: Database error.', loginState: "" });
            if (err.fatal) await initialize();
        }
        else if (result.length === 0) {
            console.log("Login failed: Invalid username or password.");
            res.status(204).json({message: "Login failed: Invalid username or password.", loginState: ""});
        }
        else {
            console.log("Logged in!");
            res.status(200).json({ loginState: result[0].username });
        }
    });
});

app.post('/checkUsernameAvailable', (req, res) => {
    let sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [req.body.username], async (err, result) => {
        if (err) {
            console.log(err);
            res.status(424).json({ message: 'Registration failed: Database error.' });
            if (err.fatal) await initialize();
        }
        else if (result.length !== 0) {
            console.log("Username already exists.");
            res.status(204).json({ message: 'Username already exists.' });
        }
        else {
            console.log("Username is available!");
            res.status(200).json({ message: 'Username is available!' });
        }
    });
});

app.post('/register', (req, res) => {
    console.log("Registering...");
    sql = 'INSERT INTO users (username, password, channels, posts) VALUES (?, ?, JSON_ARRAY(), 0)';
    db.query(sql, [req.body.username, req.body.password], async (err, _) => {
        if (err) {
            console.log(err);
            res.status(424).json({ message: 'Registration failed: Database error.' });
            if (err.fatal) await initialize();
        }
        else {
            console.log("Registered!");
            res.status(201).json({ message: 'Registered!', loginState: req.body.username });
        }
    });
});

app.post('/logout', (_, res) => {
    console.log("Logged out!");
    res.status(200).json({ message: 'Logged out!', loginState: "" });
});

app.post('/checkNameAvailable', (req, res) => {
    const name = req.body.name;
    let sql = 'SELECT * FROM channels WHERE name = ?';
    db.query(sql, [name], async (err, result) => {
        if (err) {
            console.log(err);
            res.status(424).json({ message: 'Checking channel name failed: Database error.' });
            if (err.fatal) await initialize();
        }
        else if (result.length !== 0) {
            console.log("Channel name already exists.");
            res.status(204).json({ message: 'Channel name already exists.' });
        }
        else {
            console.log("Channel name is available!");
            res.status(200).json({ message: 'Channel name is available!' });
        }
    });
});

app.post('/getUserPosts', async (req, res) => {
    let users = req.body.users;
    let sql = 'SELECT * FROM users WHERE username IN (?)';

    try {
        const result = await new Promise((resolve, reject) => {
            db.query(sql, [users], (err, result) => {
                if (err) {
                    reject(err);    
                    if (err.fatal) initialize();
                }
                else resolve(result);
            });
        });

        let formattedResult = result.map((row) => {return {username: row.username, posts: row.posts};});
        console.log("Sending user post counts...");
        res.status(200).json({users: formattedResult});
    } 
    catch (err) {
        console.log(err);
        res.status(424).json({ message: 'Getting user posts failed: Database error.' });
        if (err.fatal) await initialize();
    }
});

app.post('/addChannel', (req, res) => {
    console.log("Adding channel...");
    const name = req.body.name;
    const desc = req.body.desc;
    sql = 'INSERT INTO channels (name, description) VALUES (?, ?)';
    db.query(sql, [name, desc], async (err, _) => {
        if (err) {
            console.log(err);
            res.status(424).json({ message: 'Adding channel failed: Database error.' });
            if (err.fatal) await initialize();
        }
        console.log("Channel has been added!");
        res.status(201).json({ message: 'Channel has been added!', name: name, desc: desc });
    });
});

function getDesc(chName) {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT description FROM channels WHERE name = ?';
        db.query(sql, [chName], async (err, result) => {
            if (err) {
                reject(err);
                if (err.fatal) await initialize();
            }
            else {
                resolve(result[0].description);
            }
        });
    });
}

app.post("/getDesc", (req, res) => {
    console.log("Getting channel description...");
    const chName = req.body.chName;
    getDesc(chName).then((desc) => {
        console.log("Sending channel description...");
        res.status(200).json({ desc: desc });
    });
});

app.post('/getChannels', (req, res) => {
    console.log("Getting all channels...");

    let sql = 'SELECT * FROM channels';
    db.query(sql, async (err, result) => {
        if (err) {
            console.log(err);
            res.status(424).json({ message: 'Getting channels failed: Database error.' });
            if (err.fatal) await initialize();
        }

        else {
            let formattedResult = result.map((row) => {return {name: row.name, desc: row.description};});
            console.log("Sending all channels...");
            res.status(200).json({channels: formattedResult});
        }
    });
});

app.post('/getSubscribed', (req, res) => {
    console.log("Getting subscribed channels...");
    const userID = req.body.userID;
    let sql = 'SELECT channels FROM users WHERE username = ?';
    db.query(sql, [userID], async (err, result) => {
        if (err) {
            console.log(err);
            console.log("Failed to get subscribed channels in getSubscribed. Database error.")
            res.status(424).json({ message: 'Getting subscribed channels failed: Database error.' });
            if (err.fatal) await initialize();
        }

        else {
            try {
                if (result[0].channels) {
                    let formattedResult = await Promise.all(result[0].channels.map(async (channel) => {return {name: channel, desc: await getDesc(channel)};}));
                    console.log("Sending subscribed channels...");
                    res.status(200).json({channels: formattedResult});
                }

                else {res.status(200).json({channels: []});}
            }
            
            catch (e) {
                console.log(e);
                res.status(424).json({ message: 'Getting subscribed channels failed: Database error.' });
                if (e.fatal) await initialize();
            }
        }
    });
});

app.post('/subscribe', (req, res) => {
    console.log("Subscribing...");
    const userID = req.body.userID;
    const channelName = req.body.channelName;
    let sql = "UPDATE users SET channels = JSON_ARRAY_APPEND(channels, '$', ?) WHERE username = ?";
    db.query(sql, [channelName, userID], async (err, _) => {
        if (err) {
            console.log(err);
            res.status(424).json({ message: 'Subscribing failed: Database error.' });
            if (err.fatal) await initialize();
        }
        else {
            console.log("Subscribed!");
            res.status(200).json({ message: 'Subscribed!' });
        }
    });
});

app.post('/unsubscribe', (req, res) => {
    console.log("Unsubscribing...");
    const userID = req.body.userID;
    const channelName = req.body.channelName;
    let sql = "UPDATE users SET channels = IF(JSON_LENGTH(JSON_REMOVE(channels, JSON_UNQUOTE(JSON_SEARCH(channels, 'one', ?)))) = 0, \
        JSON_ARRAY(), \
        JSON_REMOVE(channels, JSON_UNQUOTE(JSON_SEARCH(channels, 'one', ?)))) WHERE JSON_SEARCH(channels, 'one', ?) IS NOT NULL AND username = ?";
    db.query(sql, [channelName, channelName, channelName, userID], async (err, _) => {
        if (err) {
            console.log(err);
            res.status(424).json({ message: 'Unsubscribing failed: Database error.' });
            if (err.fatal) await initialize();
        }
        else {
            console.log("Unsubscribed!");
            res.status(200).json({ message: 'Unsubscribed!' });
        }
    });
});

app.post('/isSubscribed', (req, res) => {
    const userID = req.body.userID;
    const channelName = req.body.channelName;
    let sql = 'SELECT channels FROM users WHERE username = ?';
    db.query(sql, [userID], async (err, result) => {
        if (err) {
            console.log(err);
            res.status(424).json({ message: 'Checking if subscribed failed: Database error.' });
            if (err.fatal) await initialize();
        }
        else {
            if (result[0].channels) {
                console.log("Checking if subscribed...");
                if (result.length === 0) res.status(200).json({ isSubscribed: 'n' });
                const isSubscribed = result[0].channels.includes(channelName);
                res.status(200).json({ isSubscribed: isSubscribed ? 'y' : "n" });
            }

            else res.status(200).json({ isSubscribed: 'n' });
        }
    });
});

app.post('/addPost', upload.array('image'), (req, res) => {
    console.log("Adding post...");
    const channelName = req.body.channelName;
    const topic = req.body.topic;
    const data = req.body.data;
    const userID = req.body.userID;
    const timeStamp = req.body.timeStamp;
    const parentID = req.body.parentID;
    const image = req.files.map((file) => {return file.buffer.toString('base64');});
    const imageType = req.files.map((file) => {return file.mimetype.split('/')[1];});
    const names = req.files.map((file) => {return file.originalname;});
    let sql = 'INSERT INTO posts (topic, data, username, channelName, time, parent) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [topic, data, userID, channelName, timeStamp, parentID], async (err, result) => {
        if (err) {
            console.log(err);
            res.status(424).json({ message: 'Adding post failed: Database error.', postID: null });
            if (err.fatal) await initialize();
        }
        else {
            try {
                await Promise.all(image.map((img, i) => {
                    return new Promise((resolve, reject) => {
                        let sql = 'INSERT INTO images (postID, image, format, name) VALUES (?, ?, ?, ?)';
                        db.query(sql, [result.insertId, img, imageType[i], names[i]], async (err, _) => {
                            if (err) {
                                console.log(err);
                                reject(err);
                                if (err.fatal) await initialize();
                            }

                            else {
                                console.log("Image has been added!");
                                resolve();
                            }
                        });
                    });
                }));
                let sql = 'INSERT INTO likes (postID, userLikes, userDislikes) VALUES (?, ?, ?)';
                db.query(sql, [result.insertId, JSON.stringify([]), JSON.stringify([])], async (err, _) => {
                    if (err) {
                        console.log(err);
                        res.status(424).json({ message: 'Adding likes row failed: Database error.', postID: null });
                        if (err.fatal) await initialize();
                    }

                    else {
                        let sql = 'UPDATE users SET posts = posts + 1 WHERE username = ?';
                        
                        db.query(sql, [userID], async (err, _) => {
                            if (err) {
                                console.log(err);
                                res.status(424).json({ message: 'Updating user posts failed: Database error.', postID: null });
                                if (err.fatal) await initialize();
                            }

                            else {
                                console.log("Post has been added!");
                                res.status(201).json({ message: 'Post has been added!', postID: result.insertId });
                            }
                        });
                    }
                });
            }

            catch (e) {
                console.log(e);
                res.status(424).json({ message: 'Adding post failed: Database error.', postID: null });
                if (e.fatal) await initialize();
            }
        }
    });
});

async function getLikes(postID) {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM likes WHERE postID = ?';
        db.query(sql, [postID], (err, result) => {
            if (err) {
                reject(err);
                if (err.fatal) initialize();
            }
            else resolve(result[0]);
        });
    });
}

app.post('/getPosts', async (req, res) => {
    console.log("Getting posts...");
    const channelNames = req.body.channelNames;
    let sql = 'SELECT * FROM posts WHERE channelName IN (?) AND topic IS NOT NULL';
    if (channelNames && channelNames.length === 0) {
        console.log("Sending posts...");
        res.status(200).json({posts: []});
        return;
    }

    db.query(sql, [channelNames], async (err, result) => {
        if (err) {
            console.log(err);
            res.status(424).json({ message: 'Getting posts failed: Database error.' });
            if (err.fatal) await initialize();
        }
        else {
            let formattedResult = await Promise.all(result.map(async (row) => {
                let likes = await getLikes(row.id);
                return {id: row.id, topic: row.topic, postData: row.data, username: row.username, 
                    channelName: row.channelName, depth: row.depth, time: row.time, likes: likes.userLikes.length - likes.userDislikes.length};}));
            res.status(200).json({posts: formattedResult});
        }
    });
});

app.post('/getReplies', (req, res) => {
    console.log("Getting replies...");
    const postID = req.body.postID;
    let sql = 'SELECT * FROM posts WHERE parent = ?';
    db.query(sql, [postID], async (err, result) => {
        if (err) {
            console.log(err);
            res.status(424).json({ message: 'Getting replies failed: Database error.' });
            if (err.fatal) await initialize();
        }

        else {
            let formattedResult = result.map((row) => 
            {return {id: row.id, postData: row.data, username: row.username, 
                depth: row.depth, time: row.time};});
            res.status(200).json({replies: formattedResult});
        }
    });
});

app.post('/getImages', (req, res) => {
    console.log("Getting images...");
    const postID = req.body.postID;
    let sql = 'SELECT * FROM images WHERE postID = ?';
    db.query(sql, [postID], async (err, result) => {
        if (err) {
            console.log(err);
            res.status(424).json({ message: 'Getting image failed: Database error.' });
            if (err.fatal) await initialize();
        }
        else {
            if (result.length !== 0) {
                console.log("Sending images...");
                let imgs = result.map((row) => {return {image: row.image, format: row.format, name: row.name};});
                res.status(200).json({ images: imgs });
            }
            else res.status(200).json({ image: [] });
        }
    });
});

app.post('/likePost', (req, res) => {
    const username = req.body.username;
    const postID = req.body.postID;
    let sql = 'SELECT * FROM likes WHERE postID = ?';
    db.query(sql, [postID], async (err, result) => {
        if (err) {
            console.log(err);
            res.status(424).json({ message: 'Liking post failed: Database error.' });
            if (err.fatal) await initialize();
        }
        else {
            if (result[0]) {
                if (result[0].userLikes.includes(username)) {
                    let sql = `UPDATE likes SET userLikes = IF(JSON_LENGTH(JSON_REMOVE(userLikes, JSON_UNQUOTE(JSON_SEARCH(userLikes, 'one', ?)))) = 0, \
                            JSON_ARRAY(), JSON_REMOVE(userLikes, JSON_UNQUOTE(JSON_SEARCH(userLikes, 'one', ?)))) \
                            WHERE JSON_SEARCH(userLikes, 'one', ?) IS NOT NULL AND postID = ?`;
                    db.query(sql, [username, username, username, postID], async (err, _) => {
                        if (err) {
                            console.log(err);
                            res.status(424).json({ message: 'Unliking post failed: Database error.' });
                            if (err.fatal) await initialize();
                        }
                        else {
                            console.log("Unliked!");
                            res.status(200).json({ message: 'Unliked!' });
                        }
                    });
                }

                else {
                    let sql = 'UPDATE likes SET userLikes = JSON_ARRAY_APPEND(userLikes, "$", ?) WHERE postID = ?';
                    db.query(sql, [username, postID], async (err, _) => {
                        if (err) {
                            console.log(err);
                            res.status(424).json({ message: 'Liking post failed: Database error.' });
                            if (err.fatal) await initialize();
                        }
                        else {
                            console.log("Post liked!");
                            let sql = `UPDATE likes SET userDislikes = IF(JSON_LENGTH(JSON_REMOVE(userDislikes, JSON_UNQUOTE(JSON_SEARCH(userDislikes, 'one', ?)))) = 0, \
                            JSON_ARRAY(), JSON_REMOVE(userDislikes, JSON_UNQUOTE(JSON_SEARCH(userDislikes, 'one', ?)))) \
                            WHERE postID = ? AND JSON_SEARCH(userDislikes, 'one', ?) IS NOT NULL`;
                            db.query(sql, [username, username, postID, username], async (err, _) => {
                                if (err) {
                                    console.log(err);
                                    res.status(424).json({ message: 'Liking post failed: Database error.' });
                                    if (err.fatal) await initialize();
                                }
                                else {
                                    console.log("Undisliked!");
                                    res.status(200).json({ message: 'Post liked!' });
                                }
                            });
                        }
                    });
                }
            }

        else {
            console.log("Post not found.");
            res.status(200).json({ message: 'Post not found.' });
        }
    }
})
});

app.post('/dislikePost', (req, res) => {
    const username = req.body.username;
    const postID = req.body.postID;
    let sql = 'SELECT * FROM likes WHERE postID = ?';
    db.query(sql, [postID], async (err, result) => {
        if (err) {
            console.log(err);
            res.status(424).json({ message: 'Disliking post failed: Database error.' });
            if (err.fatal) await initialize();
        }
        else {
            if (result[0]) {
                if (result[0].userDislikes.includes(username)) {
                    let sql = `UPDATE likes SET userDislikes = IF(JSON_LENGTH(JSON_REMOVE(userDislikes, JSON_UNQUOTE(JSON_SEARCH(userDislikes, 'one', ?)))) = 0, \
                        JSON_ARRAY(), JSON_REMOVE(userDislikes, JSON_UNQUOTE(JSON_SEARCH(userDislikes, 'one', ?)))) \
                        WHERE JSON_SEARCH(userDislikes, 'one', ?) IS NOT NULL AND postID = ?`;
                    db.query(sql, [username, username, username, postID], async (err, _) => {
                        if (err) {
                            console.log(err);
                            res.status(424).json({ message: 'Undisliking post failed: Database error.' });
                            if (err.fatal) await initialize();
                        }
                        else {
                            console.log("Undisliked!");
                            res.status(200).json({ message: 'Undisliked!' });
                        }
                    });
                }

                else {
                    let sql = 'UPDATE likes SET userDislikes = JSON_ARRAY_APPEND(userDislikes, "$", ?) WHERE postID = ?';
                    db.query(sql, [username, postID], async (err, _) => {
                        if (err) {
                            console.log(err);
                            res.status(424).json({ message: 'Disliking post failed: Database error.' });
                            if (err.fatal) await initialize();
                        }
                        else {
                            console.log("Post disliked!");
                            let sql = `UPDATE likes SET userLikes = IF(JSON_LENGTH(JSON_REMOVE(userLikes, JSON_UNQUOTE(JSON_SEARCH(userLikes, 'one', ?)))) = 0, \
                            JSON_ARRAY(), JSON_REMOVE(userLikes, JSON_UNQUOTE(JSON_SEARCH(userLikes, 'one', ?)))) \
                            WHERE postID = ? AND JSON_SEARCH(userLikes, 'one', ?) IS NOT NULL`;
                            db.query(sql, [username, username, postID, username], async (err, _) => {
                                if (err) {
                                    console.log(err);
                                    res.status(424).json({ message: 'Disliking post failed: Database error.' });
                                    if (err.fatal) await initialize();
                                }
                                else {
                                    console.log("Post liked!");
                                    res.status(200).json({ message: 'Unliked!' });
                                }
                            });
                        }
                    });
                }
            }

            else {
                console.log("Post not found.");
                res.status(200).json({ message: 'Post not found.' });
            }
        }
    });
});

app.post('/getLikes', (req, res) => {
    const postID = req.body.postID
    let sql = 'SELECT * FROM likes WHERE postID = ?';
    db.query(sql, [postID], async (err, result) => {
        if (err) {
            console.log(err);
            res.status(424).json({ message: 'Getting likes failed: Database error.' });
            if (err.fatal) await initialize();
        }
        else {
            if (result.length === 0) {
                console.log("No likes found.");
                res.status(200).json({ likes: 0, userLikes: [], userDislikes: [] });
            }

            console.log("Sending likes...");
            res.status(200).json({ likes: result[0].userLikes.length - result[0].userDislikes.length, 
                userLikes: result[0].userLikes, userDislikes: result[0].userDislikes });
        }
    });
});

app.post('/getUserStats', async (req, res) => {
    const username = req.body.username;
    let sql = 'SELECT * FROM posts WHERE username = ?';
    db.query(sql, [username], async (err, result) => {
        if (err) {
            console.log(err);
            res.status(424).json({ message: 'Getting user stats failed: Database error.' });
            if (err.fatal) await initialize();
        }
        else {
            if (result.length === 0) {
                console.log("User hasn't made any posts.");
                res.status(200).json({ posts: 0, likes: 0 });
            }

            else {
                console.log("Sending user stats...");
                let postsLength = result.length;
                let totalLikes = 0;

                for (let x = 0; x < postsLength; x++) {
                    let sql = 'SELECT * FROM likes WHERE postID = ?';
                    let likes = await new Promise((resolve, reject) => {
                        db.query(sql, [result[x].id], async (err, result) => {
                            if (err) {
                                reject(err);
                                if (err.fatal) await initialize();
                            }
                            else resolve(result[0]);
                        });
                    });

                    totalLikes += likes.userLikes.length - likes.userDislikes.length;
                }

                res.status(200).json({ posts: postsLength, likes: totalLikes });
            }
        }
    });
});

async function getAllChildren(postID) {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM posts WHERE parent = ?';
        db.query(sql, [postID], async (err, result) => {
            if (err) {
                reject(err);
                if (err.fatal) await initialize();
            }
            else {
                let postIDs = [];
                for (let i = 0; i < result.length; i++) {
                    let child = result[i];
                    postIDs.push([child.id, child.username]);
                    let children = await getAllChildren(child.id);
                    postIDs = postIDs.concat(children);
                }

                resolve(postIDs);
            }
        });
    });
}

app.post('/deletePost', async (req, res) => {
    const postIDs = req.body.postIDs;
    const usernames = req.body.usernames;

    const newConnection = await db.promise().getConnection();

    try {
        await newConnection.beginTransaction();

        for (let x = 0; x < postIDs.length; x++) {
            let array1 = [postIDs[x]];
            let array2 = [usernames[x]];
            let array3 = await getAllChildren(postIDs[x]);
            array1 = array1.concat(array3.map((row) => {return row[0];}));
            array2 = array2.concat(array3.map((row) => {return row[1];}));

            let sql = 'DELETE FROM posts WHERE id IN (?)';
            await newConnection.query(sql, [array1]);

            sql = 'DELETE FROM images WHERE postID IN (?)';
            await newConnection.query(sql, [array1]);

            sql = 'DELETE FROM likes WHERE postID IN (?)';
            await newConnection.query(sql, [array1]);

            let instancesOfUser = {};

            array2.forEach((username) => instancesOfUser[username] = (instancesOfUser[username] || 0) + 1);

            sql = 'UPDATE users SET posts = posts - ? WHERE username = ?';
            await Promise.all(Object.entries(instancesOfUser).map(([username, count]) => {
                return newConnection.query(sql, [count, username]);
            }));
        }

        await newConnection.commit();
        console.log("Posts recursively deleted!");
        newConnection.release();
        res.status(200).json({ message: 'Post deleted!' });
    }

    catch (error) {
        await newConnection.rollback();
        console.log(error);
        newConnection.release();
        res.status(424).json({ message: 'Deleting post failed: Database error.' });
        if (error.fatal) await initialize();
    }
});

app.post('/deleteChannel', async (req, res) => {
    const channelName = req.body.channelName;
    let sql = 'DELETE FROM channels WHERE name = ?';
    db.query(sql, [channelName], async (err, _) => {
        if (err) {
            console.log(err);
            res.status(424).json({ message: 'Deleting channel failed: Database error.' });
            if (err.fatal) await initialize();
        }
        else {
            sql = "UPDATE users SET channels = IF(JSON_LENGTH(JSON_REMOVE(channels, JSON_UNQUOTE(JSON_SEARCH(channels, 'one', ?)))) = 0, \
            JSON_ARRAY(), JSON_REMOVE(channels, JSON_UNQUOTE(JSON_SEARCH(channels, 'one', ?)))) WHERE JSON_SEARCH(channels, 'one', ?) IS NOT NULL";
            db.query(sql, [channelName, channelName, channelName], async (err, _) => {
                if (err) {
                    console.log(err);
                    res.status(424).json({ message: 'Deleting channel failed: Database error.' });
                    if (err.fatal) await initialize();
                }
                else {
                    console.log("Channel deleted!");
                    res.status(200).json({ message: 'Channel deleted!' });
                }
            });
        }
    });
});

app.post('/deleteLikes', (req, res) => {
    const username = req.body.username;
    let sql1 = 'UPDATE likes SET userLikes = IF(JSON_LENGTH(JSON_REMOVE(userLikes, JSON_UNQUOTE(JSON_SEARCH(userLikes, "one", ?)))) = 0, \
    JSON_ARRAY(), JSON_REMOVE(userLikes, JSON_UNQUOTE(JSON_SEARCH(userLikes, "one", ?)))) WHERE JSON_SEARCH(userLikes, "one", ?) IS NOT NULL';
    let sql2 = 'UPDATE likes SET userDislikes = IF(JSON_LENGTH(JSON_REMOVE(userDislikes, JSON_UNQUOTE(JSON_SEARCH(userDislikes, "one", ?)))) = 0, \
    JSON_ARRAY(), JSON_REMOVE(userDislikes, JSON_UNQUOTE(JSON_SEARCH(userDislikes, "one", ?)))) WHERE JSON_SEARCH(userDislikes, "one", ?) IS NOT NULL';
    console.log("Deleting likes...");

    db.query(sql1, [username, username, username], async (err, _) => {
        if (err) {
            console.log(err);
            res.status(424).json({ message: 'Deleting likes failed: Database error.' });
            if (err.fatal) await initialize();
        }
        else {
            db.query(sql2, [username, username, username], async (err, _) => {
                if (err) {
                    console.log(err);
                    res.status(424).json({ message: 'Deleting likes failed: Database error.' });
                    if (err.fatal) await initialize();
                }
                else {
                    console.log("Likes deleted!");
                    res.status(200).json({ message: 'Likes deleted!' });
                }
            });
        }
    });
});

app.post('/deleteUserPosts', async (req, res) => {
    const username = req.body.username;
    const newConnection = await db.promise().getConnection();
    let sql = 'SELECT * FROM posts WHERE username = ?';
    try {
        const [rows] = await newConnection.query(sql, [username]);
        console.log(rows);
        console.log("Deleting user posts...");
        let postIDs = rows.map((row) => {return [row.id]});
        let usernames = rows.map((row) => {return [row.username]});

        await newConnection.beginTransaction();

        for (let x = 0; x < postIDs.length; x++) {
            let array1 = [postIDs[x]];
            let array2 = [usernames[x]];
            let array3 = await getAllChildren(postIDs[x]);
            array1 = array1.concat(array3.map((row) => {return row[0];}));
            array2 = array2.concat(array3.map((row) => {return row[1];}));

            let sql = 'DELETE FROM posts WHERE id IN (?)';
            await newConnection.query(sql, [array1]);

            sql = 'DELETE FROM images WHERE postID IN (?)';
            await newConnection.query(sql, [array1]);

            sql = 'DELETE FROM likes WHERE postID IN (?)';
            await newConnection.query(sql, [array1]);

            let instancesOfUser = {};

            array2.forEach((username) => instancesOfUser[username] = (instancesOfUser[username] || 0) + 1);

            sql = 'UPDATE users SET posts = posts - ? WHERE username = ?';
            await Promise.all(Object.entries(instancesOfUser).map(([username, count]) => {
                return newConnection.query(sql, [count, username]);
            }));
        }

        await newConnection.commit();
        console.log("User posts recursively deleted!");
        newConnection.release();
        res.status(200).json({ message: 'Post deleted!' });
    }
    catch (error) {
        await newConnection.rollback();
        console.log(error);
        newConnection.release();
        res.status(424).json({ message: 'Deleting post failed: Database error.' });
        if (error.fatal) await initialize();
    }
});

app.post('/deleteUser', (req, res) => {
    const username = req.body.username;
    console.log("Deleting user " + username + "...");
    let sql = 'DELETE FROM users WHERE username = ?';
    db.query(sql, [username], async (err, _) => {
        if (err) {
            console.log(err);
            res.status(424).json({ message: 'Deleting user failed: Database error.' });
            if (err.fatal) await initialize();
        }
        else {
            console.log("User deleted!");
            res.status(200).json({ message: 'User deleted!' });
        }
    });
});

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT + ".");
});
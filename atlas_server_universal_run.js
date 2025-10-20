const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const uri =
  "mongodb+srv://kravavlad_db_user:AlanAndAsa1001@cluster0.noua1a3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Middleware для підключення до бази даних
async function connectToDatabase(req, res, next) {
  try {
    if (!client.connect()) {
      await client.connect();
    }
    req.dbClient = client;
    // req.db = client.db("myFirstDatabase"); // Змініть на на вашу базу даних
    req.db = client.db("sample_airbnb");
    next();
  } catch (error) {
    console.error("Помилка підключення до бази даних:", error);
    res.status(500).json({ error: "Помилка підключення до бази даних" });
  }
}

// Використовуємо middleware для всіх routes
app.use(connectToDatabase);

// GET всі документи з колекції
app.get("/api/:collection", async (req, res) => {
  try {
    const collection = req.db.collection(req.params.collection);
    const documents = await collection.find({}).toArray();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET документ за ID
app.get("/api/:collection/:id", async (req, res) => {
  try {
    const collection = req.db.collection(req.params.collection);

    // Try to find by ObjectId first
    let document;
    try {
      document = await collection.findOne({
        _id: new ObjectId(req.params.id),
      });
    } catch (err) {
      // If ObjectId fails, try with string ID
      document = await collection.findOne({
        _id: req.params.id,
      });
    }

    if (!document) {
      return res.status(404).json({ message: "Документ не знайдено" });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST створення нового документа
app.post("/api/:collection", async (req, res) => {
  try {
    const collection = req.db.collection(req.params.collection);
    const result = await collection.insertOne({
      ...req.body,
      createdAt: new Date(),
    });

    const newDocument = await collection.findOne({
      _id: result.insertedId,
    });
    res.status(201).json(newDocument);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT оновлення документа
app.put("/api/:collection/:id", async (req, res) => {
  try {
    const collection = req.db.collection(req.params.collection);
    let filter;

    // Try to determine if ID is an ObjectId or a string
    try {
      filter = { _id: new ObjectId(req.params.id) };
    } catch (err) {
      filter = { _id: req.params.id };
    }

    const result = await collection.findOneAndUpdate(
      filter,
      {
        $set: {
          ...req.body,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({ message: "Документ не знайдено" });
    }
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE видалення документа
app.delete("/api/:collection/:id", async (req, res) => {
  try {
    const collection = req.db.collection(req.params.collection);
    let filter;

    // Try to determine if ID is an ObjectId or a string
    try {
      filter = { _id: new ObjectId(req.params.id) };
    } catch (err) {
      filter = { _id: req.params.id };
    }

    const result = await collection.findOneAndDelete(filter);

    if (!result) {
      return res.status(404).json({ message: "Документ не знайдено" });
    }
    res.json({ message: "Документ видалено", deletedDocument: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET пошук документів за параметрами (із підтримкою limit/skip)
app.get("/api/:collection/search/query", async (req, res) => {
  try {
    const collection = req.db.collection(req.params.collection);
    const query = {};

    // Копіюємо параметри, окрім службових
    const searchParams = { ...req.query };
    delete searchParams.collection;
    delete searchParams.limit;
    delete searchParams.skip;

    console.log("Search parameters:", searchParams);

    // Побудова фільтра
    Object.keys(searchParams).forEach((key) => {
      if (key === "_id" || key === "id") {
        try {
          query[key === "id" ? "_id" : key] = searchParams[key];
        } catch (err) {
          console.error("Error with string ID:", err);
        }
      } else if (!isNaN(searchParams[key])) {
        query[key] = Number(searchParams[key]);
      } else {
        query[key] = { $regex: searchParams[key], $options: "i" };
      }
    });

    console.log("Final query:", JSON.stringify(query));

    // ✅ Створюємо курсор
    let cursor = collection.find(query);

    // ✅ Додаємо підтримку skip/limit
    if (req.query.skip) {
      cursor = cursor.skip(Number(req.query.skip));
    }
    if (req.query.limit) {
      cursor = cursor.limit(Number(req.query.limit));
    }

    // Виконуємо запит
    const documents = await cursor.toArray();

    res.json(documents);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET агрегація даних
app.get("/api/:collection/aggregate", async (req, res) => {
  try {
    const collection = req.db.collection(req.params.collection);

    // Отримуємо параметри агрегації з запиту
    const { field } = req.query;

    if (!field) {
      return res
        .status(400)
        .json({ message: "Необхідно вказати поле для агрегації" });
    }

    const pipeline = [
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          avg: { $avg: `$${field}` },
          min: { $min: `$${field}` },
          max: { $max: `$${field}` },
        },
      },
    ];

    const stats = await collection.aggregate(pipeline).toArray();
    res.json(stats[0] || { message: "Немає даних для агрегації" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Додаткова функція для діагностики
app.get("/api/:collection/debug-id/:id", async (req, res) => {
  try {
    const collection = req.db.collection(req.params.collection);
    const idToFind = req.params.id;

    // Спробуємо знайти документ з різними форматами ID
    const results = {
      asString: await collection.find({ _id: idToFind }).toArray(),
      withRegex: await collection
        .find({ _id: { $regex: idToFind, $options: "i" } })
        .toArray(),
      sample5docs: await collection.find().limit(5).toArray(),
    };

    // Спробуємо як ObjectId, але обробимо помилку
    try {
      results.asObjectId = await collection
        .find({ _id: new ObjectId(idToFind) })
        .toArray();
    } catch (err) {
      results.objectIdError = err.message;
    }

    res.json({
      searchedFor: idToFind,
      results,
      message: "Цей ендпоінт допомагає діагностувати проблеми з пошуком за ID",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Обробка помилок підключення
process.on("SIGINT", async () => {
  try {
    await client.close();
    console.log("MongoDB відключено");
    process.exit(0);
  } catch (error) {
    console.error("Помилка при закритті з'єднання:", error);
    process.exit(1);
  }
});

app.use(require("express").json());

// CREATE
app.post("/api/:coll/insertOne", async (req, res, next) => {
  try {
    const r = await req.db.collection(req.params.coll).insertOne(req.body);
    res.status(201).json(r);
  } catch (e) { next(e); }
});

// UPDATE
app.patch("/api/:coll/updateOne", async (req, res, next) => {
  try {
    const { filter, update } = req.body;
    const r = await req.db.collection(req.params.coll).updateOne(filter, update);
    res.json(r);
  } catch (e) { next(e); }
});

// DELETE
app.delete("/api/:coll/deleteOne", async (req, res, next) => {
  try {
    const { filter } = req.body;
    const r = await req.db.collection(req.params.coll).deleteOne(filter);
    res.json(r);
  } catch (e) { next(e); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущено на порту ${PORT}`);
});
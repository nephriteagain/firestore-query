# Firestore Query (@nephriteagain/firestore-query)

A powerful command-line interface for querying and managing your Firestore database. Firestore Query provides intuitive commands to perform CRUD operations, aggregations, and database management tasks directly from your terminal.

## Installation

```bash
npm install -g @nephriteagain/firestore-query
```

## Quick Start

1. **Link your Firebase Admin Service Account:**
   ```bash
   fsq link path/to/your/service-account.json
   ```

2. **Start querying your Firestore database:**
   ```bash
   # List all root collections
   fsq list

   # Get documents from a collection
   fsq get users -l 10

   # Create a new document
   fsq create users -f name,John email,john@example.com
   ```

## Commands

### 🔗 `link` - Link Firebase Service Account
Connect your Firebase Admin service account to enable database operations.

```bash
fsq link <path-to-service-account.json>
```

**Example:**
```bash
fsq link ./config/firebase-admin-key.json
```

### 🔓 `unlink` - Unlink Service Account
Remove the linked Firebase service account.

```bash
fsq unlink
```

### 📋 `list` - List Collections
List Firestore collections at root level or subcollections within a document.

```bash
fsq list [path]
```

**Examples:**
```bash
# List all root collections
fsq list

# List subcollections in a document
fsq list users/abc123

# List and save to file
fsq list -s collections.txt
```

### 📖 `get` - Retrieve Documents
Fetch documents or collections with powerful filtering, ordering, and field selection.

```bash
fsq get <path> [options]
```

**Options:**
- `-l, --limit [number]` - Maximum documents to retrieve (default: 20)
- `-f, --fields [fields...]` - Specific fields to include
- `-o, --order-by [field]` - Order documents (add =desc for descending)
- `-w, --where <conditions...>` - Filter documents with where clauses
- `-c, --collection-group` - Query collection group
- `-j, --json` - Output as JSON
- `-s, --save [filename]` - Save results to file

**Examples:**
```bash
# Get a single document
fsq get users/abc123

# Get 10 users with specific fields
fsq get users -l 10 -f name email age

# Get users ordered by creation date
fsq get users -l 5 -o created_at=desc

# Filter users by status
fsq get users -w status,==,active age,>,18,int

# Query collection group
fsq get posts -c -l 100

# Save results as JSON
fsq get users -j -s users.json
```

### ➕ `create` - Create Documents
Create new documents with specified fields and data types.

```bash
fsq create <path> -f <field,value,type> [field,value,type...]
```

**Supported Types:** `string`, `int`, `number`, `float`, `bool`, `boolean`, `null`, `date`

**Examples:**
```bash
# Create document with auto-generated ID
fsq create users -f name,John email,john@example.com

# Create document with specific ID
fsq create users/abc123 -f name,John age,25,int active,true,bool

# Create with date fields
fsq create posts -f title,Hello created_at,now,date

# Create with mixed data types
fsq create products -f name,Widget price,19.99,float stock,100,int
```

### ✏️ `update` - Update Documents
Update existing documents with new field values.

```bash
fsq update <document-path> -f <field,value,type> [field,value,type...]
```

**Examples:**
```bash
# Update string fields
fsq update users/abc123 -f name,John email,john@example.com

# Update with different data types
fsq update users/abc123 -f age,26,int active,true,bool

# Update with timestamps
fsq update posts/xyz789 -f updated_at,now,date

# Set field to null
fsq update users/abc123 -f deleted_at,null,null
```

### 📊 `aggregate` - Aggregate Data
Perform count, sum, and average aggregations on collections.

```bash
fsq aggregate <collection-path> [options]
```

**Options:**
- `--count` - Count documents
- `--sum <field>` - Sum values of a field
- `--average <field>` - Calculate average of a field
- `-l, --limit [number]` - Limit documents to aggregate
- `-w, --where <conditions...>` - Filter before aggregating
- `-c, --collection-group` - Aggregate collection group
- `-j, --json` - Output as JSON
- `-s, --save [filename]` - Save results to file

**Examples:**
```bash
# Count all users
fsq aggregate users --count

# Sum all scores in games collection
fsq aggregate games --sum score

# Get average age of active users
fsq aggregate users --average age -w status,==,active

# Multiple aggregations
fsq aggregate orders --count --sum total --average total

# Save aggregation results
fsq aggregate users --count --average age -s stats.json
```

## Field Types & Formatting

When creating or updating documents, specify field types using the format: `field,value,type`

### Supported Types:
- **`string`** (default) - Text values
- **`int`**, **`number`** - Integers
- **`float`** - Decimal numbers
- **`bool`**, **`boolean`** - Boolean values (true/false)
- **`null`** - Null values
- **`date`** - Dates (timestamps, "now", or date strings)

### Date Field Examples:
```bash
# Current timestamp
fsq create posts -f created_at,now,date

# Specific timestamp (milliseconds)
fsq create posts -f created_at,1648771200000,date

# Date string
fsq create posts -f created_at,"2024-01-15",date
```

## Where Clause Syntax

Filter documents using Firestore's where operators with comma-separated format: `field,operation,value,type`

**Supported Operations:** `==`, `!=`, `<`, `<=`, `>`, `>=`, `array-contains`, `array-contains-any`, `in`, `not-in`

```bash
# Equality
fsq get users -w status,==,active

# Comparison operators
fsq get users -w age,>,18,int score,<=,100,int

# Multiple conditions
fsq get users -w status,==,active age,>,18,int premium,==,true,bool

# String comparison  
fsq get users -w name,>=,A name,<,B

# Array operations
fsq get users -w tags,array-contains,premium

# With different data types
fsq get users -w created_at,>,2024-01-01,date price,<=,99.99,float
```

## File Output

Save command results to files using the `-s` or `--save` option:

```bash
# Save as JSON
fsq get users -j -s users.json

# Save formatted output
fsq list -s collections.txt

# Save aggregation results
fsq aggregate users --count -s user-count.json
```

## Global Options

- **`-h, --help`** - Show command help
- **`-V, --version`** - Show version number

## Configuration

Firestore Query stores your service account configuration in your system's config directory. Use `fsq link` to set up authentication and `fsq unlink` to remove it.

## Examples Workflow

Here's a typical workflow using Firestore Query:

```bash
# 1. Link your Firebase project
fsq link ./firebase-admin-key.json

# 2. Explore your database structure
fsq list

# 3. Get some sample data
fsq get users -l 5 -f name email

# 4. Create a new user
fsq create users -f name,"Jane Doe" email,jane@example.com age,28,int

# 5. Update the user
fsq update users/[generated-id] -f verified,true,bool

# 6. Get some statistics
fsq aggregate users --count --average age

# 7. Clean up when done
fsq unlink
```

## Support

For issues, feature requests, or questions, please visit our [GitHub repository](https://github.com/nephriteagain/firestore-query).

## License

MIT License - see LICENSE file for details.

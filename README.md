# FirestoreQ (firestoreq)

A powerful command-line interface for querying and managing your Firestore database. FirestoreQ provides intuitive commands to perform CRUD operations, aggregations, and database management tasks directly from your terminal.

## Installation

```bash
npm install -g firestoreq
```

## Quick Start

1. **Link your Firebase Admin Service Account:**
   ```bash
   firestoreq link path/to/your/service-account.json
   ```

2. **Start querying your Firestore database:**
   ```bash
   # List all root collections
   firestoreq list

   # Get documents from a collection
   firestoreq get users -l 10

   # Create a new document
   firestoreq create users -f name,John email,john@example.com
   ```

## Commands

### 🔗 `link` - Link Firebase Service Account
Connect your Firebase Admin service account to enable database operations.

```bash
firestoreq link <path-to-service-account.json>
```

**Example:**
```bash
firestoreq link ./config/firebase-admin-key.json
```

### 🔓 `unlink` - Unlink Service Account
Remove the linked Firebase service account.

```bash
firestoreq unlink
```

### 📋 `list` - List Collections
List Firestore collections at root level or subcollections within a document.

```bash
firestoreq list [path]
```

**Examples:**
```bash
# List all root collections
firestoreq list

# List subcollections in a document
firestoreq list users/abc123

# List and save to file
firestoreq list -s collections.txt
```

### 📖 `get` - Retrieve Documents
Fetch documents or collections with powerful filtering, ordering, and field selection.

```bash
firestoreq get <path> [options]
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
firestoreq get users/abc123

# Get 10 users with specific fields
firestoreq get users -l 10 -f name email age

# Get users ordered by creation date
firestoreq get users -l 5 -o created_at=desc

# Filter users by status
firestoreq get users -w status=active age>18

# Query collection group
firestoreq get posts -c -l 100

# Save results as JSON
firestoreq get users -j -s users.json
```

### ➕ `create` - Create Documents
Create new documents with specified fields and data types.

```bash
firestoreq create <path> -f <field,value,type> [field,value,type...]
```

**Supported Types:** `string`, `int`, `number`, `float`, `bool`, `boolean`, `null`, `date`

**Examples:**
```bash
# Create document with auto-generated ID
firestoreq create users -f name,John email,john@example.com

# Create document with specific ID
firestoreq create users/abc123 -f name,John age,25,int active,true,bool

# Create with date fields
firestoreq create posts -f title,Hello created_at,now,date

# Create with mixed data types
firestoreq create products -f name,Widget price,19.99,float stock,100,int
```

### ✏️ `update` - Update Documents
Update existing documents with new field values.

```bash
firestoreq update <document-path> -f <field,value,type> [field,value,type...]
```

**Examples:**
```bash
# Update string fields
firestoreq update users/abc123 -f name,John email,john@example.com

# Update with different data types
firestoreq update users/abc123 -f age,26,int active,true,bool

# Update with timestamps
firestoreq update posts/xyz789 -f updated_at,now,date

# Set field to null
firestoreq update users/abc123 -f deleted_at,null,null
```

### 📊 `aggregate` - Aggregate Data
Perform count, sum, and average aggregations on collections.

```bash
firestoreq aggregate <collection-path> [options]
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
firestoreq aggregate users --count

# Sum all scores in games collection
firestoreq aggregate games --sum score

# Get average age of active users
firestoreq aggregate users --average age -w status=active

# Multiple aggregations
firestoreq aggregate orders --count --sum total --average total

# Save aggregation results
firestoreq aggregate users --count --average age -s stats.json
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
firestoreq create posts -f created_at,now,date

# Specific timestamp (milliseconds)
firestoreq create posts -f created_at,1648771200000,date

# Date string
firestoreq create posts -f created_at,"2024-01-15",date
```

## Where Clause Syntax

Filter documents using Firestore's where operators:

```bash
# Equality
firestoreq get users -w status=active

# Comparison operators
firestoreq get users -w age>18 score<=100

# Multiple conditions
firestoreq get users -w status=active age>18 premium=true

# String comparison
firestoreq get users -w name>=A name<B
```

## File Output

Save command results to files using the `-s` or `--save` option:

```bash
# Save as JSON
firestoreq get users -j -s users.json

# Save formatted output
firestoreq list -s collections.txt

# Save aggregation results
firestoreq aggregate users --count -s user-count.json
```

## Global Options

- **`-h, --help`** - Show command help
- **`-V, --version`** - Show version number

## Configuration

FirestoreQ stores your service account configuration in your system's config directory. Use `firestoreq link` to set up authentication and `firestoreq unlink` to remove it.

## Examples Workflow

Here's a typical workflow using FirestoreQ:

```bash
# 1. Link your Firebase project
firestoreq link ./firebase-admin-key.json

# 2. Explore your database structure
firestoreq list

# 3. Get some sample data
firestoreq get users -l 5 -f name email

# 4. Create a new user
firestoreq create users -f name,"Jane Doe" email,jane@example.com age,28,int

# 5. Update the user
firestoreq update users/[generated-id] -f verified,true,bool

# 6. Get some statistics
firestoreq aggregate users --count --average age

# 7. Clean up when done
firestoreq unlink
```

## Support

For issues, feature requests, or questions, please visit our [GitHub repository](https://github.com/your-repo/firestoreq).

## License

MIT License - see LICENSE file for details.

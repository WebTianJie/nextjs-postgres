import { neon } from "@neondatabase/serverless";
import { revalidatePath } from "next/cache";

const databaseUrl = process.env.DATABASE_URL;
const sql = databaseUrl ? neon(databaseUrl) : null;

export default async function Home() {
    const result = await sql?.query("SELECT * FROM users");
    console.log("results", result);

    async function createFunction(formData: FormData) {
        "use server";
        const name = formData.get("name");
        const age = formData.get("age");
        await sql?.query("INSERT INTO users (name, age) VALUES ($1, $2)", [name, age]);
        revalidatePath("/");
    }

    async function deleteFunction(formData: FormData) {
        "use server";
        const id = formData.get("id");
        await sql?.query("DELETE FROM users WHERE id = $1", [id]);
        revalidatePath("/");
    }

    return (
        <div>
            <h1>Postgres 数据库</h1>
            <div>
                <form action={createFunction}>
                    <label htmlFor="name">Name:</label>
                    <input type="text" className="border-1" id="name" name="name" required />
                    <label htmlFor="age">Age:</label>
                    <input type="number" className="border-1" id="age" name="age" required />
                    <button type="submit" className="cursor-pointer">
                        Create User
                    </button>
                </form>
                {result?.map((item: any, index: number) => (
                    <div key={item.id} className="flex items-center gap-4 p-2 border-b">
                        <div className="flex-1">
                            <p>{item.name}</p>
                            <p>{item.age}</p>
                        </div>
                        <form action={deleteFunction}>
                            <input type="hidden" name="id" value={item.id} />
                            <button type="submit" className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer">
                                删除
                            </button>
                        </form>
                    </div>
                ))}
            </div>
        </div>
    );
}

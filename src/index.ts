import { z } from "zod";

function resolver(name: string) {
  return {
    age: 30,
    name,
  };
}

type ResolverType = ReturnType<typeof resolver>;

const generator = (data: ResolverType) => {
  let schema = z.object({});

  const keys = Object.keys(data);
  const values = Object.values(data);

  const getCorrectZodType = (value: any) => {
    if (typeof value === "string") {
      return z.string();
    }
    return z.any();
  };

  for (const index in Object.keys(data)) {
    const key = keys[index];
    const value = values[index];
    schema = schema.merge(
      z.object({
        [key]: getCorrectZodType(value),
      })
    );
  }
  return schema;
};

const generated = generator( resolver("test"));

generated.parse({
  age: 30,
  name: "test",
})


try {
  generated.parse({
    age: 30,
    name: 1,
  })
} catch (error) {
  console.log(error instanceof z.ZodError && error.format());
}




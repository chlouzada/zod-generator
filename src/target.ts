export const asd = (name: string) => {
  const a = () => 30;

  return {
    age: a(),
    name,
    test: `ok`,

    test2: {
      agora: `nao`,
      e:  a(),
      name,
      test: `ok`,
    },
  };
};

export function resolver  (name: string)  {
  const a = () => 30;

  return {
    age: a(),
    name,
    test: `ok`,

    test2: {
      agora: `nao`,
      e:  a(),
      name,
      test: `ok`,
    },
  };
};


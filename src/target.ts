const a = 1

const b = 'ok'


function resolver(name: string) {
  return {
    age: 30,
    name,
  };
}

const resolver2 = (name: string) => {
  const a = () => 30

  return {
    age: a(),
    name,
    test: `ok`
  };
}
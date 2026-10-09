def normalizar_beneficio(valores):
    minimo = min(valores)
    maximo = max(valores)

    if maximo == minimo:
        return [1.0] * len(valores)

    return [
        (valor - minimo) / (maximo - minimo)
        for valor in valores
    ]


def normalizar_costo(valores):
    minimo = min(valores)
    maximo = max(valores)

    if maximo == minimo:
        return [1.0] * len(valores)

    return [
        (maximo - valor) / (maximo - minimo)
        for valor in valores
    ]
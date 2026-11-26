
import serial
import httpx
import re
import time

# Configurações da comunicação
PORTA = "/dev/ttyACM0"
BAUDRATE = 9600
API_URL = "http://127.0.0.1:8000/leitura_sensor"

# Intervalo de envio ao Supabase (em segundos)
INTERVALO_ENVIO = 30

# IDs cadastrados no Supabase
ID_DHT11 = 9
ID_SENSOR_SOLO = 7

# IDs da tabela grandeza_fisica
UMIDADE_SOLO = 1
TEMPERATURA = 2
UMIDADE_AR = 3


def enviar_leitura(id_sensor, id_grandeza, valor, outros_dados=None):
    dados = {
        "id_sensor": id_sensor,
        "id_grandeza": id_grandeza,
        "valor_leitura": round(float(valor), 2)
    }

    if outros_dados is not None:
        dados["outros_dados"] = outros_dados

    try:
        resposta = httpx.post(
            API_URL,
            json=dados,
            timeout=10
        )
        resposta.raise_for_status()

        print("Leitura salva:", dados)

    except httpx.HTTPStatusError as erro:
        print("Erro da API:", erro.response.status_code)
        print(erro.response.text)

    except httpx.RequestError as erro:
        print("Erro de comunicação com a API:", erro)


def processar_linha(linha, leituras):
    # Umidade do ar
    umidade = re.search(
        r"Umidade do ar:\s*(\d+(?:[.,]\d+)?)\s*%",
        linha,
        re.IGNORECASE
    )

    if umidade:
        valor = umidade.group(1).replace(",", ".")
        leituras["umidade_ar"] = float(valor)

    # Temperatura do ar
    temperatura = re.search(
        r"Temperatura:\s*(-?\d+(?:[.,]\d+)?)",
        linha,
        re.IGNORECASE
    )

    if temperatura:
        valor = temperatura.group(1).replace(",", ".")
        leituras["temperatura"] = float(valor)

    # Umidade do solo: 1 = úmido / 0 = seco
    solo = re.search(
        r"Solo:\s*(UMIDO|ÚMIDO|SECO)",
        linha,
        re.IGNORECASE
    )

    if solo:
        estado = solo.group(1).upper()

        if estado == "UMIDO":
            estado = "ÚMIDO"

        valor = 1 if estado == "ÚMIDO" else 0

        leituras["solo"] = (valor, estado)


def enviar_leituras(leituras):
    print("\nEnviando leituras ao Supabase...")

    if "umidade_ar" in leituras:
        enviar_leitura(
            ID_DHT11,
            UMIDADE_AR,
            leituras["umidade_ar"]
        )

    if "temperatura" in leituras:
        enviar_leitura(
            ID_DHT11,
            TEMPERATURA,
            leituras["temperatura"]
        )

    if "solo" in leituras:
        valor, estado = leituras["solo"]

        enviar_leitura(
            ID_SENSOR_SOLO,
            UMIDADE_SOLO,
            valor,
            estado
        )

    print("Envio finalizado!\n")


def iniciar_integracao():
    print("Conectando ao Arduino...")

    # Guarda sempre os valores mais recentes
    leituras = {}

    try:
        with serial.Serial(PORTA, BAUDRATE, timeout=1) as arduino:
            time.sleep(2)
            arduino.reset_input_buffer()

            print("Arduino conectado!")
            print("Intervalo de envio:", INTERVALO_ENVIO, "segundos")
            print("Aguardando leituras...\n")

            proximo_envio = time.monotonic() + INTERVALO_ENVIO

            while True:
                linha = arduino.readline().decode(
                    "utf-8",
                    errors="ignore"
                ).strip()

                if linha:
                    print("Arduino:", linha)
                    processar_linha(linha, leituras)

                # Verifica se chegou a hora de enviar
                if time.monotonic() >= proximo_envio:
                    if leituras:
                        enviar_leituras(leituras)
                    else:
                        print("Ainda não há leituras disponíveis.")

                    proximo_envio = time.monotonic() + INTERVALO_ENVIO

    except serial.SerialException as erro:
        print("Erro ao acessar a porta serial:", erro)

    except KeyboardInterrupt:
        print("\nIntegração encerrada.")


if __name__ == "__main__":
    iniciar_integracao()

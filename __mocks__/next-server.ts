export class NextRequest {
  public headers: Headers;
  public url: string;
  public method: string;

  constructor(input: string | Request, init?: RequestInit) {
    if (typeof input === "string") {
      this.url = input;
      this.method = init?.method || "GET";
      this.headers = new Headers(init?.headers);
    } else {
      this.url = input.url;
      this.method = input.method;
      this.headers = input.headers;
    }
  }
}

export class NextResponse {
  public status: number;
  public headers: Headers;
  public body: any;

  constructor(body?: any, init?: ResponseInit) {
    this.status = init?.status || 200;
    this.headers = new Headers(init?.headers);
    this.body = body;
  }

  static json(body: any, init?: ResponseInit) {
    return new NextResponse(body, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  }

  async json() {
    return this.body;
  }
}